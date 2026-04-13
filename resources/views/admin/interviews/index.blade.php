@extends('admin.layout')

@section('content')

<h3>Interviews ☕</h3>

@foreach($interviews as $interview)

<div class="card card-cafe p-3 mb-3">

    <h5>{{ $interview->application->user->name }}</h5>
    <p>Date: {{ $interview->interview_date }}</p>
    <p>Status: {{ $interview->status }}</p>

</div>

@endforeach

@endsection