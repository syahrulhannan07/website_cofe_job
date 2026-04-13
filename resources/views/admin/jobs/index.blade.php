@extends('admin.layout')

@section('content')

<h3>Jobs ☕</h3>

<a href="/admin/jobs/create" class="btn btn-cafe mb-3">+ Add Job</a>

@foreach($jobs as $job)

<div class="card card-cafe p-3 mb-3">

    <h5>{{ $job->title }}</h5>
    <p>{{ $job->description }}</p>

    <small>Status: {{ $job->status }}</small>

</div>

@endforeach

@endsection