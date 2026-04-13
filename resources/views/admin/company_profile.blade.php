@extends('admin.layout')

@section('content')

<h3>Company Profile ☕</h3>

<form method="POST" action="/admin/company-profile">
@csrf

<div class="card card-cafe p-3">

    <label>Name</label>
    <input type="text" name="name" value="{{ $company->name }}" class="form-control">

    <label>Description</label>
    <textarea name="description" class="form-control mt-2">{{ $company->description }}</textarea>

    <label>Address</label>
    <input type="text" name="address" value="{{ $company->address }}" class="form-control mt-2">

    <label>Phone</label>
    <input type="text" name="phone" value="{{ $company->phone }}" class="form-control mt-2">

    <button class="btn btn-cafe mt-3">Save</button>

</div>

</form>

@endsection