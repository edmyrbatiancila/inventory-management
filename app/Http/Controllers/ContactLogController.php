<?php

namespace App\Http\Controllers;

use App\Constants\ContactLogConstants;
use App\Models\ContactLog;
use App\Http\Requests\StoreContactLogRequest;
use App\Http\Requests\UpdateContactLogRequest;
use App\Http\Resources\ContactLogResource;
use App\Services\ContactLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ContactLogController extends Controller
{
    protected $contactLogService;

    public function __construct(ContactLogService $contactLogService)
    {
        $this->contactLogService = $contactLogService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'contact_type', 'direction', 'priority', 'outcome', 
                'contactable_type', 'contact_person_id', 'date_from', 
                'date_to', 'needs_follow_up'
            ]);

            $contactLogs = $this->contactLogService->getAllContactLogs($filters);
            $metrics = $this->contactLogService->getContactLogMetrics($filters);

            return Inertia::render('ContactLogs/Index', [
                'contactLogs' => ContactLogResource::collection($contactLogs),
                'filters' => $filters,
                'metrics' => $metrics,
                'constants' => [
                    'contact_types' => ContactLogConstants::CONTACT_TYPES,
                    'directions' => ContactLogConstants::DIRECTIONS,
                    'outcomes' => ContactLogConstants::OUTCOMES,
                    'priorities' => ContactLogConstants::PRIORITIES,
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load contact logs: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('ContactLogs/Create', [
            'constants' => [
                'contact_types' => ContactLogConstants::CONTACT_TYPES,
                'directions' => ContactLogConstants::DIRECTIONS,
                'outcomes' => ContactLogConstants::OUTCOMES,
                'priorities' => ContactLogConstants::PRIORITIES,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContactLogRequest $request)
    {
        try {
            $contactLog = $this->contactLogService->createContactLog($request->validated());

            return redirect()->route('contact-logs.show', $contactLog)
                            ->with('success', 'Contact log created successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                            ->withErrors($e->errors())
                            ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                            ->with('error', 'Failed to create contact log: ' . $e->getMessage())
                            ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ContactLog $contactLog)
    {
        try {
            $contactLog->load(['contactable', 'contactPerson']);
            
            $activitySummary = $this->contactLogService->getActivitySummary(
                $contactLog->contactable_type,
                $contactLog->contactable_id
            );

            return Inertia::render('ContactLogs/Show', [
                'contactLog' => new ContactLogResource($contactLog),
                'activitySummary' => $activitySummary,
                'constants' => [
                    'contact_types' => ContactLogConstants::CONTACT_TYPES,
                    'directions' => ContactLogConstants::DIRECTIONS,
                    'outcomes' => ContactLogConstants::OUTCOMES,
                    'priorities' => ContactLogConstants::PRIORITIES,
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->route('contact-logs.index')
                            ->with('error', 'Contact log not found.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ContactLog $contactLog)
    {
        try {
            $contactLog->load(['contactable', 'contactPerson']);

            return Inertia::render('ContactLogs/Edit', [
                'contactLog' => new ContactLogResource($contactLog),
                'constants' => [
                    'contact_types' => ContactLogConstants::CONTACT_TYPES,
                    'directions' => ContactLogConstants::DIRECTIONS,
                    'outcomes' => ContactLogConstants::OUTCOMES,
                    'priorities' => ContactLogConstants::PRIORITIES,
                ],
            ]);
        } catch (\Exception $e) {
            return redirect()->route('contact-logs.index')
                            ->with('error', 'Contact log not found.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContactLogRequest $request, ContactLog $contactLog)
    {
        try {
            $updatedContactLog = $this->contactLogService->updateContactLog(
                $contactLog->id,
                $request->validated()
            );

            return redirect()->route('contact-logs.show', $updatedContactLog)
                            ->with('success', 'Contact log updated successfully.');
        } catch (ValidationException $e) {
            return redirect()->back()
                            ->withErrors($e->errors())
                            ->withInput();
        } catch (\Exception $e) {
            return redirect()->back()
                            ->with('error', 'Failed to update contact log: ' . $e->getMessage())
                            ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ContactLog $contactLog)
    {
        try {
            $this->contactLogService->deleteContactLog($contactLog->id);

            return redirect()->route('contact-logs.index')
                            ->with('success', 'Contact log deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                            ->with('error', 'Failed to delete contact log: ' . $e->getMessage());
        }
    }

    // API endpoints for AJAX calls
    public function search(Request $request)
    {
        try {
            $filters = $request->only([
                'contact_type', 'direction', 'priority', 'outcome',
                'contactable_type', 'date_from', 'date_to'
            ]);

            $contactLogs = $this->contactLogService->getAllContactLogs($filters);

            return response()->json([
                'success' => true,
                'data' => ContactLogResource::collection($contactLogs)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByEntity(Request $request, string $type, int $id)
    {
        try {
            $contactLogs = $this->contactLogService->getContactLogsForEntity($type, $id);

            return response()->json([
                'success' => true,
                'data' => ContactLogResource::collection($contactLogs)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load contact logs: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getFollowUps()
    {
        try {
            $followUps = $this->contactLogService->getFollowUpsDue();

            return response()->json([
                'success' => true,
                'data' => ContactLogResource::collection($followUps)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load follow-ups: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markFollowUpComplete(ContactLog $contactLog)
    {
        try {
            $this->contactLogService->markFollowUpCompleted($contactLog);

            return response()->json([
                'success' => true,
                'message' => 'Follow-up marked as complete.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark follow-up as complete: ' . $e->getMessage()
            ], 500);
        }
    }
}
