<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\Application;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index()
    {
        $interviews = Interview::with('application.user')->get();
        return view('admin.interviews.index', compact('interviews'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'application_id' => 'required',
            'interview_date' => 'required',
            'location' => 'nullable'
        ]);

        Interview::create([
            'application_id' => $request->application_id,
            'interview_date' => $request->interview_date,
            'location' => $request->location,
            'status' => 'scheduled'
        ]);

        // update status aplikasi jadi wawancara
        Application::find($request->application_id)->update([
            'status' => 'wawancara'
        ]);

        return redirect()->back()->with('success', 'Interview scheduled');
    }
}