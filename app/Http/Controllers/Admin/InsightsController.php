<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessInsight;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InsightsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    public function index(Request $request)
    {
        $insights = BusinessInsight::with(['assignedTo', 'createdBy'])
            ->when($request->search, fn($q, $search) => 
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"))
            ->when($request->type, fn($q, $type) => 
                $q->where('type', $type))
            ->when($request->category, fn($q, $category) => 
                $q->where('category', $category))
            ->when($request->severity, fn($q, $severity) => 
                $q->where('severity', $severity))
            ->when($request->status, fn($q, $status) => 
                $q->where('status', $status))
            ->when($request->priority, fn($q, $priority) => 
                $q->where('priority', $priority))
            ->orderByRaw("FIELD(status, 'new', 'acknowledged', 'in_progress', 'resolved', 'dismissed')")
            ->orderByRaw("FIELD(severity, 'critical', 'high', 'medium', 'low')")
            ->latest('detected_at')
            ->paginate(20);

        return Inertia::render('Admin/Insights/Index', [
            'insights' => $insights,
            'filters' => $request->only(['search', 'type', 'category', 'severity', 'status', 'priority']),
            'stats' => $this->getInsightStats()
        ]);
    }

    public function show(BusinessInsight $insight)
    {
        $insight->load(['assignedTo', 'createdBy', 'acknowledgedBy', 'resolvedBy']);
        
        return Inertia::render('Admin/Insights/Show', [
            'insight' => $insight,
            'relatedInsights' => $this->getRelatedInsights($insight)
        ]);
    }

    public function acknowledge(BusinessInsight $insight)
    {
        $insight->update([
            'status' => BusinessInsight::STATUS_ACKNOWLEDGED,
            'acknowledged_by' => auth()->id(),
            'acknowledged_at' => now()
        ]);

        return back()->with('success', 'Insight acknowledged successfully');
    }

    public function assign(Request $request, BusinessInsight $insight)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id'
        ]);

        $insight->update($validated);

        return back()->with('success', 'Insight assigned successfully');
    }

    public function updateStatus(Request $request, BusinessInsight $insight)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,acknowledged,in_progress,resolved,dismissed',
            'resolution_notes' => 'nullable|string'
        ]);

        $updateData = ['status' => $validated['status']];

        if ($validated['status'] === BusinessInsight::STATUS_RESOLVED) {
            $updateData['resolved_by'] = auth()->id();
            $updateData['resolved_at'] = now();
            
            if ($request->resolution_notes) {
                $updateData['resolution_notes'] = $validated['resolution_notes'];
            }
        }

        $insight->update($updateData);

        return back()->with('success', 'Insight status updated successfully');
    }

    public function feedback(Request $request, BusinessInsight $insight)
    {
        $validated = $request->validate([
            'feedback_positive' => 'required|boolean',
            'feedback_notes' => 'nullable|string'
        ]);

        $insight->update([
            'user_feedback_positive' => $validated['feedback_positive'],
            'user_feedback_notes' => $validated['feedback_notes'] ?? null
        ]);

        return back()->with('success', 'Feedback submitted successfully');
    }

    public function detect()
    {
        try {
            $detectedInsights = $this->analyticsService->detectAnomalies();
            
            $createdCount = 0;
            foreach ($detectedInsights as $insightData) {
                // Check if similar insight exists recently
                $exists = BusinessInsight::where('type', $insightData['type'])
                    ->where('category', $insightData['category'])
                    ->where('status', '!=', BusinessInsight::STATUS_RESOLVED)
                    ->where('detected_at', '>=', now()->subHours(24))
                    ->exists();

                if (!$exists) {
                    BusinessInsight::create($insightData);
                    $createdCount++;
                }
            }

            return back()->with('success', "Detected {$createdCount} new insights");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to detect insights: ' . $e->getMessage());
        }
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:acknowledge,assign,resolve,dismiss',
            'insight_ids' => 'required|array',
            'insight_ids.*' => 'exists:business_insights,id',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string'
        ]);

        $insights = BusinessInsight::whereIn('id', $validated['insight_ids']);

        switch ($validated['action']) {
            case 'acknowledge':
                $insights->update([
                    'status' => BusinessInsight::STATUS_ACKNOWLEDGED,
                    'acknowledged_by' => auth()->id(),
                    'acknowledged_at' => now()
                ]);
                break;

            case 'assign':
                if ($validated['assigned_to']) {
                    $insights->update(['assigned_to' => $validated['assigned_to']]);
                }
                break;

            case 'resolve':
                $insights->update([
                    'status' => BusinessInsight::STATUS_RESOLVED,
                    'resolved_by' => auth()->id(),
                    'resolved_at' => now(),
                    'resolution_notes' => $validated['resolution_notes'] ?? null
                ]);
                break;

            case 'dismiss':
                $insights->update([
                    'status' => BusinessInsight::STATUS_DISMISSED,
                    'resolved_by' => auth()->id(),
                    'resolved_at' => now()
                ]);
                break;
        }

        $count = count($validated['insight_ids']);
        return back()->with('success', "Successfully {$validated['action']}d {$count} insights");
    }

    private function getInsightStats(): array
    {
        return [
            'total' => BusinessInsight::count(),
            'new' => BusinessInsight::where('status', BusinessInsight::STATUS_NEW)->count(),
            'in_progress' => BusinessInsight::where('status', BusinessInsight::STATUS_IN_PROGRESS)->count(),
            'high_priority' => BusinessInsight::whereIn('priority', ['high', 'critical'])->active()->count(),
            'critical_severity' => BusinessInsight::where('severity', 'critical')->active()->count(),
            'resolved_today' => BusinessInsight::where('status', BusinessInsight::STATUS_RESOLVED)
                ->whereDate('resolved_at', today())->count()
        ];
    }

    private function getRelatedInsights(BusinessInsight $insight, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        return BusinessInsight::where('id', '!=', $insight->id)
            ->where(function($query) use ($insight) {
                $query->where('category', $insight->category)
                      ->orWhere('type', $insight->type);
            })
            ->where('status', '!=', BusinessInsight::STATUS_DISMISSED)
            ->latest('detected_at')
            ->limit($limit)
            ->get();
    }
}