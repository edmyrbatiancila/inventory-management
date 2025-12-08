<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsReport;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function index(Request $request)
    {
        $reports = AnalyticsReport::with(['createdBy'])
            ->when($request->search, fn($q, $search) => 
                $q->where('title', 'like', "%{$search}%"))
            ->when($request->type, fn($q, $type) => 
                $q->where('type', $type))
            ->when($request->status, fn($q, $status) => 
                $q->where('status', $status))
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Analytics/Index', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'type', 'status'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Analytics/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:inventory_summary,stock_movement,purchase_analytics,sales_analytics,warehouse_performance,financial_summary,operational_kpis,custom_report',
            'frequency' => 'required|in:real_time,daily,weekly,monthly,quarterly,yearly,on_demand',
            'filters' => 'nullable|array',
            'metrics' => 'nullable|array',
            'auto_generate' => 'boolean',
            'email_on_completion' => 'boolean',
            'email_recipients' => 'nullable|array'
        ]);

        $report = AnalyticsReport::create($validated);

        if ($request->generate_now) {
            return redirect()->route('admin.analytics.generate', $report);
        }

        return redirect()->route('admin.analytics.index')
            ->with('success', 'Analytics report created successfully');
    }

    public function show(AnalyticsReport $analyticsReport)
    {
        $analyticsReport->load(['createdBy', 'updatedBy']);
        $analyticsReport->increment('view_count');
        $analyticsReport->update(['last_viewed_at' => now()]);

        return Inertia::render('Admin/Analytics/Show', [
            'report' => $analyticsReport
        ]);
    }

    public function edit(AnalyticsReport $analyticsReport)
    {
        return Inertia::render('Admin/Analytics/Edit', [
            'report' => $analyticsReport
        ]);
    }

    public function update(Request $request, AnalyticsReport $analyticsReport)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:inventory_summary,stock_movement,purchase_analytics,sales_analytics,warehouse_performance,financial_summary,operational_kpis,custom_report',
            'frequency' => 'required|in:real_time,daily,weekly,monthly,quarterly,yearly,on_demand',
            'filters' => 'nullable|array',
            'metrics' => 'nullable|array',
            'auto_generate' => 'boolean',
            'email_on_completion' => 'boolean',
            'email_recipients' => 'nullable|array'
        ]);

        $analyticsReport->update($validated);

        return redirect()->route('admin.analytics.index')
            ->with('success', 'Analytics report updated successfully');
    }

    public function destroy(AnalyticsReport $analyticsReport)
    {
        if ($analyticsReport->file_path && Storage::exists($analyticsReport->file_path)) {
            Storage::delete($analyticsReport->file_path);
        }

        $analyticsReport->delete();

        return redirect()->route('admin.analytics.index')
            ->with('success', 'Analytics report deleted successfully');
    }

    public function generate(Request $request, AnalyticsReport $report)
    {
        $report->update(['status' => AnalyticsReport::STATUS_GENERATING]);

        try {
            $startTime = now();
            
            $reportData = match($report->type) {
                'inventory_summary' => $this->analyticsService->generateInventorySummaryReport($report->filters ?? []),
                'stock_movement' => $this->analyticsService->generateStockMovementReport($report->filters ?? []),
                default => ['data' => [], 'summary_stats' => []]
            };

            $generationTime = now()->diffInSeconds($startTime);

            $report->update([
                'status' => AnalyticsReport::STATUS_COMPLETED,
                'data' => $reportData['data'],
                'summary_stats' => $reportData['summary_stats'],
                'total_value' => $reportData['summary_stats']['total_value'] ?? null,
                'total_items' => $reportData['summary_stats']['total_items'] ?? null,
                'generated_at' => now(),
                'generation_time_seconds' => $generationTime
            ]);

            if ($report->email_on_completion && $report->email_recipients) {
                // TODO: Implement email notification
            }

            return redirect()->route('admin.analytics.show', $report)
                ->with('success', 'Report generated successfully');

        } catch (\Exception $e) {
            $report->update([
                'status' => AnalyticsReport::STATUS_FAILED,
                'error_message' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to generate report: ' . $e->getMessage());
        }
    }

    public function export(AnalyticsReport $report, Request $request)
    {
        $format = $request->input('format', 'pdf');
        
        // TODO: Implement export functionality
        // For now, return the data as JSON
        return response()->json([
            'report' => $report,
            'format' => $format
        ]);
    }

    public function dashboard()
    {
        $widgets = $this->analyticsService->getExecutiveDashboardWidgets();
        
        return Inertia::render('Admin/Analytics/Dashboard', [
            'widgets' => $widgets
        ]);
    }
}