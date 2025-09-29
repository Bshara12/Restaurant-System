<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ManagerController;
use App\Models\Customer;
use App\Models\Employees;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
  // public
  Route::get('/logout', [AuthController::class, 'logout']);
  Route::post('/CreateFood', [EmployeeController::class, 'CreateFood']);
  Route::post('/UpdateFood/{id}', [EmployeeController::class, 'UpdateFood']);
  Route::delete('/deleteFood/{id}', [EmployeeController::class, 'deleteFood']);
  Route::post('/createOrder', [CustomerController::class, 'createOrder']);


  // Admin
  Route::prefix('Admin')->group(function () {

    Route::post('/CreateRestaurent', [AdminController::class, 'CreateRestaurent']);
    Route::delete('/deleteRestaurant/{id}', [AdminController::class, 'deleteRestaurant']);
    Route::post('/updateRestaurant/{id}', [AdminController::class, 'updateRestaurant']);
    Route::delete('/deleteReastaurant/{id}', [AdminController::class, 'deleteReastaurant']);
    Route::get('/getManagersWithRestaurants', [AdminController::class, 'getManagersWithRestaurants']);
    Route::post('/CreateCatigory', [AdminController::class, 'CreateCatigory']);
    Route::get('/GetAllCategory', [AdminController::class, 'GetAllCategory']);
    Route::get('/GetAllRest', [AdminController::class, 'GetAllRest']);
    Route::get('/GetResDetails/{id}', [AdminController::class, 'GetResDetails']);
    Route::get('/GetAllManager', [AdminController::class, 'GetAllManager']);
    Route::get('GetManagerDetails/{id}', [AdminController::class, 'GetManagerDetails']);
    Route::delete('/DeleteUser/{id}', [AdminController::class, 'DeleteUser']);
    Route::delete('/DeleteCategory/{id}', [AdminController::class, 'DeleteCategory']);
  });

  // Manager
  Route::prefix('Manager')->group(function () {
    Route::post('/CreateEmployee', [ManagerController::class, 'CreateEmployee']);
    Route::post('/editEmployee/{id}', [ManagerController::class, 'editEmployee']);
    Route::delete('/deleteEmployee/{id}', [ManagerController::class, 'deleteEmployee']);
    Route::post('/CreateTable', [ManagerController::class, 'CreateTable']);
    Route::delete('/deleteTable/{id}', [ManagerController::class, 'deleteTable']);
    Route::get('/getEmployee/{id}', [ManagerController::class, 'getEmployee']);
    Route::post('/CreateCategoryinRes', [ManagerController::class, 'CreateCategoryinRes']);
    Route::get('/GetCategories', [ManagerController::class, 'GetCategories']);
    Route::delete('/deleteCategory/{id}', [ManagerController::class, 'deleteCategory']);
    Route::get('/getTableinRestaurant', [ManagerController::class, 'getTableinRestaurant']);
    Route::get('/GetReviewToRes/{id}', [ManagerController::class, 'GetReviewToRes']);
    Route::get('/GetAllEmployee', [ManagerController::class, 'GetAllEmployee']);
    Route::get('/GetAllJop', [ManagerController::class, 'GetAllJop']);
    Route::get('/GetFoodDiscount', [ManagerController::class, 'GetFoodDiscount']);
    Route::delete('/deleteCatigoryinres/{id}', [ManagerController::class, 'deleteCatigoryinres']);
    Route::get('/GetComplaints', [ManagerController::class, 'GetComplaints']);
    Route::delete('/DeleteComplain/{id}', [ManagerController::class, 'DeleteComplain']);
  });

  // Employee
  Route::prefix('Employee')->group(function () {
    Route::get('EditOrder/{id}', [EmployeeController::class, 'EditOrder']);
    Route::get('/getOrderDetails/{id}', [EmployeeController::class, 'getOrderDetails']);
    Route::get('/getAllOrders', [EmployeeController::class, 'getAllOrders']);
    Route::delete('/deleteMusic/{id}', [CustomerController::class, 'deleteMusic']);
    Route::post('/CreateParking', [EmployeeController::class, 'CreateParking']);
    Route::delete('/deleteCar/{id}', [EmployeeController::class, 'deleteCar']);
    Route::get('/getInvoice/{id}', [EmployeeController::class, 'getInvoice']);
    Route::get('/getFoodInRestaurant', [EmployeeController::class, 'getFoodInRestaurant']);
    Route::post('/createMusicAsEmployee', [CustomerController::class, 'createMusicAsEmployee']);
    Route::get('/GetallMusic', [CustomerController::class, 'GetallMusic']);
    Route::get('/GetRestaurantParkings', [EmployeeController::class, 'GetRestaurantParkings']);
    Route::get('/getRestaurantMessages',[EmployeeController::class,'getRestaurantMessages']);
    Route::delete('/deleteMessage/{id}',[EmployeeController::class,'deleteMessage']);
  });
  Route::post('/CreateComplain', [EmployeeController::class, 'CreateComplain']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
  return $request->user();
});

Route::get('/updateTable/{id}', [EmployeeController::class, 'updateTable']);


Route::get('/generateToken/{id}', [CustomerController::class, 'generateToken']);
Route::post('/scanLogin', [CustomerController::class, 'scanLogin']);
Route::get('/releaseTable/{id}', [CustomerController::class, 'releaseTable']);
Route::get('/parking/update-status/{n_car}', [EmployeeController::class, 'UpdateParkingStatus']);

// customer
Route::prefix('Customer')->group(function () {
  Route::post('/createOrder', [CustomerController::class, 'createOrder']);
  Route::post('/Addtolist', [CustomerController::class, 'Addtolist']);
  Route::get('/getlist/{id}', [CustomerController::class, 'getlist']);
  Route::get('/deletefoodfromlist/{id}', [CustomerController::class, 'deletefoodfromlist']);
  Route::get('/CreateOrder/{id}', [CustomerController::class, 'CreateOrder']);
  Route::get('/getCustomerOrders/{id}', [CustomerController::class, 'getCustomerOrders']);
  Route::post('/CreateMusic/{id}', [CustomerController::class, 'CreateMusic']);
  Route::get('/GetMyCar/{qr}', [CustomerController::class, 'GetMyCar']);
  Route::post('/CreateReview', [CustomerController::class, 'CreateReview']);
  Route::post('/createMusicAsCustomer/{id}', [CustomerController::class, 'createMusicAsCustomer']);
  Route::post('/callwaiter/{id}',[CustomerController::class,'callwaiter']);
  Route::get('/getFoodByRestaurantId/{id}',[CustomerController::class,'getFoodByRestaurantId']);
  Route::get('/GetallMusicForCustomer/{id}',[CustomerController::class,'GetallMusicForCustomer']);
});
