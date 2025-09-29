<?php

namespace App\Http\Controllers;

use App\Models\Employees;
use App\Models\Jobs;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
  public function register(Request $request)
  {
    $request->validate([
      'username' => ['required'],
      'email' => ['required', 'unique:users,email'],
      'password' => ['required'],
      'role' => ['required']
    ], [
      'username.required' => 'Username is required',
      'email.required' => 'Email is required',
      'email.unique' => 'Email already exists',
      'password.required' => 'Password is required',
      'role.required' => 'role is required',
    ]);

    $user = User::query()->create([
      'username' => $request['username'],
      'email' => $request['email'],
      'password' => $request['password'],
      'role' => $request['role'] // Corrected this line
    ]);

    $token = $user->createToken('AccessToken')->plainTextToken;
    $data = [];
    $data['token'] = $token;
    $data['user'] = $user;

    return response()->json([
      'message' => 'User created successfully',
      'data' => $data,
      'status' => 200
    ]);
  }

  // public function login(Request $request){
  //    $request->validate([
  //     'email'=>['required'],
  //     'password' =>['required']
  //    ]);
  //    if(!Auth::attempt($request->only(['email','password']))){
  //     $message='email & password does not mach';
  //     return response()->json([
  //       'data'=>[],
  //       'message'=>$message,
  //       'status'=>0
  //     ],500);
  //    }
  //    $user=User::query()->where('email','=',$request['email'])->first();
  //    $token= $user->createToken('auth_token')->plainTextToken;
  //    $data=[];
  //    $data['user'] = $user;
  //    $data['token']=$token;
  //    return response()->json([
  //     'status' =>'200',
  //     'data' => $data,
  //     'message'=>'Welcome'
  //    ]);
  // }


  public function login(Request $request)
  {
    $request->validate([
      'email' => ['required'],
      'password' => ['required']
    ]);

    if (!Auth::attempt($request->only(['email', 'password']))) {
      $message = 'email & password does not match';
      return response()->json([
        'data' => [],
        'message' => $message,
        'status' => 0
      ], 500);
    }

    $user = User::where('email', $request['email'])->first();

    // إذا كان الدور Employee، اجلب اسم الوظيفة
    if ($user->role === 'Employee') {
      $employee = Employees::where('user_id', $user->id)->first();
      if ($employee) {
        $job = Jobs::find($employee->job_id);
        if ($job) {
          $user->role = $job->name; // استبدال قيمة الدور باسم الوظيفة
        }
      }
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    $data = [];
    $data['user'] = $user;
    $data['token'] = $token;

    return response()->json([
      'status' => '200',
      'data' => $data,
      'message' => 'Welcome'
    ]);
  }


  public function logout()
  {
    Auth::user()->currentAccessToken()->delete();
    return response()->json([
      'data' => [],
      'status' => 1,
      'message' => 'logeout succesfuly'
    ]);
  }
}
