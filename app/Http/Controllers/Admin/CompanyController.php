<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function index()
    {
        $company = Company::findOrFail(Auth::user()->company_id);
        return view('admin.company-profile', compact('company'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'address' => 'nullable',
            'phone' => 'nullable'
        ]);

        $company = Company::findOrFail(Auth::user()->company_id);

        $company->update($request->all());

        return redirect()->back()->with('success', 'Company updated successfully');
    }
}