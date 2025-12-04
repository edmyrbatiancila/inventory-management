<?php

namespace App\Http\Controllers;

use App\Models\ContactLog;
use App\Http\Requests\StoreContactLogRequest;
use App\Http\Requests\UpdateContactLogRequest;

class ContactLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContactLogRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ContactLog $contactLog)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ContactLog $contactLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateContactLogRequest $request, ContactLog $contactLog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ContactLog $contactLog)
    {
        //
    }
}
