<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $companyId = Auth::user()->company_id;

        $totalJobs = JobPosting::where('company_id', $companyId)->count();

        $totalApplicants = Application::whereHas('job', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        $statusCount = Application::whereHas('job', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->select('status')
          ->get()
          ->groupBy('status');

        return view('admin.dashboard', compact(
            'totalJobs',
            'totalApplicants',
            'statusCount'
        ));
    }
}