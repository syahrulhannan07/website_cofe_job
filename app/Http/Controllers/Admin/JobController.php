<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index()
    {
        $jobs = JobPosting::where('company_id', Auth::user()->company_id)->get();
        return view('admin.jobs.index', compact('jobs'));
    }

    public function create()
    {
        return view('admin.jobs.create');
    }

    public function store(Request $request)
    {
        JobPosting::create([
            'company_id' => Auth::user()->company_id,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'salary' => $request->salary,
            'status' => 'open'
        ]);

        return redirect()->route('jobs.index');
    }

    public function edit($id)
    {
        $job = JobPosting::findOrFail($id);
        return view('admin.jobs.edit', compact('job'));
    }

    public function update(Request $request, $id)
    {
        $job = JobPosting::findOrFail($id);
        $job->update($request->all());

        return redirect()->route('jobs.index');
    }

    public function destroy($id)
    {
        JobPosting::findOrFail($id)->delete();
        return redirect()->back();
    }
}