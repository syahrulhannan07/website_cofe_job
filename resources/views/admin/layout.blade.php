<!DOCTYPE html>
<html>
<head>
    <title>Cafe Job Admin</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            background: #f5f1ea;
        }

        .sidebar {
            width: 250px;
            height: 100vh;
            position: fixed;
            background: #3b2f2f;
            color: white;
            padding: 20px;
        }

        .sidebar h3 {
            color: #d7b899;
        }

        .sidebar a {
            display: block;
            color: #fff;
            padding: 10px;
            text-decoration: none;
            margin: 5px 0;
            border-radius: 5px;
        }

        .sidebar a:hover {
            background: #6f4e37;
        }

        .content {
            margin-left: 260px;
            padding: 20px;
        }

        .navbar-custom {
            background: #6f4e37;
            color: white;
            padding: 10px;
            border-radius: 8px;
        }

        .card-cafe {
            background: #fff;
            border-left: 6px solid #6f4e37;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .btn-cafe {
            background: #6f4e37;
            color: white;
        }

        .btn-cafe:hover {
            background: #4b3621;
            color: white;
        }
    </style>
</head>

<body>

<div class="sidebar">
    <h3>☕ CafeJob</h3>
    <a href="/admin/dashboard">Dashboard</a>
    <a href="/admin/company-profile">Company</a>
    <a href="/admin/jobs">Jobs</a>
    <a href="/admin/applicants">Applicants</a>
    <a href="/admin/interviews">Interviews</a>
</div>

<div class="content">
    <div class="navbar-custom mb-4">
        <h5>Admin Panel</h5>
    </div>

    @yield('content')
</div>

</body>
</html>