<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Temporary fix: Check if user is the admin email
        if (Auth::check() && Auth::user()->email === 'admin@gmail.com') {
            return $next($request);
        }
        
        abort(401, 'Unauthorized Access');
    }
}
