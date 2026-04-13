@extends('admin.layout')

@section('content')

<div class="row">

    <div class="col-md-4">
        <div class="card card-cafe p-3">
            <h5>Total Jobs</h5>
            <h2>{{ $totalJobs }}</h2>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card card-cafe p-3">
            <h5>Total Applicants</h5>
            <h2>{{ $totalApplicants }}</h2>
        </div>
    </div>

</div>

@endsection