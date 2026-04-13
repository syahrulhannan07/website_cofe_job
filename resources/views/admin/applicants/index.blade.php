@extends('admin.layout')

@section('content')

<h3>Applicants ☕</h3>

@foreach($applications as $app)

<div class="card card-cafe p-3 mb-3">

    <h5>{{ $app->user->name }}</h5>
    <p>Job: {{ $app->job->title }}</p>

    <form method="POST" action="/admin/applicants/{{ $app->id }}/status">
        @csrf

        <select name="status" class="form-control">
            <option value="diproses">Diproses</option>
            <option value="wawancara">Wawancara</option>
            <option value="diterima">Diterima</option>
            <option value="ditolak">Ditolak</option>
        </select>

        <button class="btn btn-cafe mt-2">Update</button>
    </form>

</div>

@endforeach

@endsection