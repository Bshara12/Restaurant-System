<?php

namespace App\Http\Controllers;

use App\Models\Categories;
use App\Models\Complaints;
use App\Models\Employees;
use App\Models\Food;
use App\Models\Jobs;
use App\Models\Reastaurant;
use App\Models\Res_Cat;
use App\Models\Review;
use App\Models\Tables;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use function PHPUnit\Framework\isEmpty;

class ManagerController extends Controller
{

  // public function CreateEmployee(Request $request)
  // {
  //   $users = Auth::user();
  //   if ($users['role'] == 'manager' || $users['role'] == 'Manager') {
  //     $request->validate([
  //       'username' => ['required'],
  //       'email' => ['required', 'unique:users,email'],
  //       'password' => ['required'],
  //       'job_id' => ['required'],
  //       'reastaurant_id' => ['required']
  //     ], [
  //       'username.required' => 'Please enter your username',
  //       'email.required' => 'Please enter your email',
  //       'password.required' => 'Please enter your password',
  //       'job_id.required' => 'Please enter your job id',
  //       'reastaurant_id.required' => 'Please enter your restaurant id'
  //     ]);
  //     $user = User::query()->create([
  //       'username' => $request['username'],
  //       'email' => $request['email'],
  //       'password' => $request['password'],
  //       'role' => 'Employee'
  //     ]);

  //     $Employee = Employees::query()->create([
  //       'user_id' => $user->id,
  //       'job_id' => $request['job_id'],
  //       'reastaurant_id' => $request['reastaurant_id']
  //     ]);
  //     $data = [];
  //     $data['user'] = $user;
  //     $data['employee'] = $Employee;
  //     return response()->json([
  //       'message' => 'Employee created successfully',
  //       'data' => $data
  //     ], 200);
  //   } else {
  //     return response()->json([
  //       'message' => 'You are not authorized to create employee'
  //     ]);
  //   }
  // }









  // public function GetComplaints($id)
  // {
  //   $restaurant = Reastaurant::query()->where('id', '=', $id)->first();
  //   if ($restaurant) {
  //     $complaints = Complaints::query()->where('reastaurant_id', '=', $id)->get();
  //     return response()->json([
  //       'complaints' => $complaints
  //     ]);
  //   } else {
  //     return response()->json([
  //       'message' => 'Restaurant not found'
  //     ]);
  //   }
  // }


  public function CreateEmployee(Request $request)
  {
    $users = Auth::user();

    if (strtolower($users->role) === 'manager') {

      // جلب المطعم المرتبط بالمدير الحالي
      $restaurant = Reastaurant::where('user_id', $users->id)->first();

      if (!$restaurant) {
        return response()->json([
          'message' => 'Restaurant not found for this manager'
        ], 404);
      }

      // التحقق من البيانات
      $request->validate([
        'username' => ['required'],
        'email' => ['required', 'unique:users,email'],
        'password' => ['required'],
        'job_id' => ['required'],
      ], [
        'username.required' => 'Please enter your username',
        'email.required' => 'Please enter your email',
        'password.required' => 'Please enter your password',
        'job_id.required' => 'Please enter your job id',
      ]);

      // إنشاء المستخدم الجديد
      $user = User::create([
        'username' => $request->username,
        'email' => $request->email,
        'password' => $request->password, // يفضل عمل Hash للـ password
        'role' => 'Employee'
      ]);

      // إنشاء سجل الموظف وربطه بالمطعم الذي يملكه المدير
      $employee = Employees::create([
        'user_id' => $user->id,
        'job_id' => $request->job_id,
        'reastaurant_id' => $restaurant->id
      ]);

      return response()->json([
        'message' => 'Employee created successfully',
        'data' => [
          'user' => $user,
          'employee' => $employee
        ]
      ], 200);
    } else {
      return response()->json([
        'message' => 'You are not authorized to create employee'
      ], 403);
    }
  }

  public function GetComplaints()
  {
    // جلب المستخدم الحالي
    $user = Auth::user();

    if (!$user) {
      return response()->json([
        'message' => 'User not authenticated',
      ], 401);
    }

    // جلب المطعم المرتبط بالمستخدم
    $restaurant = Reastaurant::where('user_id', $user->id)->first();

    if (!$restaurant) {
      return response()->json([
        'message' => 'Restaurant not found for this user',
      ], 404);
    }

    // جلب الشكاوى الخاصة بالمطعم
    $complaints = Complaints::where('reastaurant_id', $restaurant->id)->get();

    return response()->json([
      'complaints' => $complaints
    ]);
  }



  public function DeleteComplain($id)
  {
    $complaint = Complaints::query()->where('id', '=', $id)->first();
    if ($complaint) {
      $complaint->delete();
      return response()->json([
        'message' => 'Complaint deleted successfully'
      ]);
    } else {
      return response()->json([
        'message' => 'Complaint not found'
      ]);
    }
  }



  public function editEmployee(Request $request, $id)
  {
    $employee = Employees::query()->where('id', $id)->first();
    if ($employee) {
      $request->validate([
        'job_id' => ['required']
      ], [
        'job_id.required' => 'Job id is required'
      ]);
      $employee->update([
        'job_id' => $request['job_id']
      ]);
      return response()->json([
        'message' => 'Employee updated successfully'
      ], 200);
    } else {
      return response()->json([
        'message' => 'Employee not found'
      ]);
    }
  }

  public function deleteEmployee($id)
  {
    $employee = Employees::query()->where('id', '=', $id)->first();
    $user = User::query()->where('id', '=', $employee->user_id)->first();
    if ($employee) {
      $employee->delete();
      if ($user) {
        $user->delete();
      }
      return response()->json([
        'message' => 'Employee deleted successfully'
      ], 200);
    } else {
      return response()->json([
        'message' => 'Employee not found'
      ]);
    }
  }

  // public function CreateTable(Request $request, $id)
  // {
  //   $restaurant = Reastaurant::query()->where('id', $id)->first();
  //   if ($restaurant) {
  //     $request->validate([
  //       'table_number' => ['required'],
  //     ]);
  //     $existingTable = Tables::query()->where('reastaurants_id', $restaurant->id)
  //       ->where('table_number', $request['table_number'])->first();
  //     if ($existingTable) {
  //       return response()->json([
  //         'message' => 'Table number already exists in this restaurant'
  //       ], 400);
  //     }
  //     $table = Tables::create([
  //       'reastaurants_id' => $restaurant->id,
  //       'table_number' => $request['table_number'],
  //       'status' => 'vacant'
  //     ]);
  //     return response()->json([
  //       'message' => 'Table created successfully'
  //     ], 200);
  //   } else {
  //     return response()->json([
  //       'message' => 'Restaurant not found'
  //     ]);
  //   }
  // }


  public function CreateTable(Request $request)
  {
    $request->validate([
      'table_number' => ['required'],
    ]);

    $user = auth()->user();
    if (!$user || $user['role'] !== 'Manager') {
      return response()->json(['message' => 'Unauthorized'], 403);
    }
    // نجيب الموظف المرتبط بالمستخدم الحالي
    $restaurant = Reastaurant::where('user_id', $user->id)->first();
    if (!$restaurant) {
      return response()->json(['message' => 'restaurant record not found'], 404);
    }
    $restaurantId = $restaurant->id;
    if (!$restaurantId) {
      return response()->json(['message' => 'Restaurant not found for employee'], 404);
    }

    // نتأكد إنو رقم الطاولة ما مكرر بنفس المطعم
    $existingTable = Tables::where('reastaurants_id', $restaurantId)
      ->where('table_number', $request->table_number)
      ->first();

    if ($existingTable) {
      return response()->json([
        'message' => 'Table number already exists in this restaurant'
      ], 400);
    }

    // إنشاء الطاولة
    $table = Tables::create([
      'reastaurants_id' => $restaurantId,
      'table_number'    => $request->table_number,
      'status'          => 'vacant'
    ]);

    return response()->json([
      'message' => 'Table created successfully',
      'table'   => $table
    ], 200);
  }

  public function deleteTable($id)
  {
    $table = Tables::query()->where('id', $id)->first();
    if ($table) {
      $table->delete();
      return response()->json([
        'message' => 'Table deleted successfully'
      ], 200);
    } else {
      return response()->json([
        'message' => 'Table not found'
      ]);
    }
  }

  // public function getTableinRestaurant()
  // {
  //   $user = auth()->user();
  //   if (!$user || $user->role !== 'Manager') {
  //     return response()->json(['message' => 'Unauthorized'], 403);
  //   }

  //   // نجيب المطعم المرتبط بالـ Manager الحالي
  //   $restaurant = Reastaurant::where('user_id', $user->id)->first();
  //   if (!$restaurant) {
  //     return response()->json(['message' => 'Restaurant record not found'], 404);
  //   }

  //   $tables = Tables::where('reastaurants_id', $restaurant->id)->get();

  //   if ($tables->count() > 0) {
  //     return response()->json([
  //       'tables' => $tables
  //     ], 200);
  //   }

  //   return response()->json([
  //     'message' => 'There is no table in this restaurant'
  //   ], 200);
  // }




  public function getTableinRestaurant()
  {
    $user = auth()->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $restaurantId = null;

    // الحالة الأولى: Manager
    if ($user->role === 'Manager') {
      $restaurant = Reastaurant::where('user_id', $user->id)->first();
      if (!$restaurant) {
        return response()->json(['message' => 'Restaurant record not found'], 404);
      }
      $restaurantId = $restaurant->id;
    }

    // الحالة الثانية: Employee
    elseif ($user->role === 'Employee') {
      $employee = Employees::where('user_id', $user->id)->first();
      if (!$employee) {
        return response()->json(['message' => 'Employee record not found'], 404);
      }
      $restaurantId = $employee->reastaurant_id;
    } else {
      return response()->json(['message' => 'Unauthorized role'], 403);
    }

    // جلب الطاولات
    $tables = Tables::where('reastaurants_id', $restaurantId)->get();
    if ($tables->count() > 0) {
      return response()->json([
        'tables' => $tables
      ], 200);
    }

    return response()->json([
      'message' => 'There is no table in this restaurant'
    ], 200);
  }



  public function getEmployee($id)
  {
    $restaurant = Reastaurant::where('id', $id)->first(); // Ensure we get the restaurant instance
    if ($restaurant) {
      $employee = Employees::where('reastaurant_id', $id)->get();
      if ($employee->isEmpty()) {
        return response()->json([
          'message' => 'No employees found for this restaurant.'
        ], 404);
      }
      return response()->json([
        'message' => 'Employees found',
        'employee' => $employee
      ], 200);
    } else {
      return response()->json([
        'message' => 'Restaurant not found'
      ], 404);
    }
  }

  // public function CreateCategoryinRes(Request $request)
  // {
  //   $request->validate([
  //     'restaurant_id' => ['required'],
  //     'Category_id' => ['required']
  //   ], [
  //     'restaurant_id.required' => 'Restaurant id is required',
  //     'Category_id.required' => 'Category id is required'
  //   ]);
  //   $category = Categories::query()->where('id', $request->Category_id)->first();
  //   if ($category) {
  //     $restaurant = Reastaurant::query()->where('id', $request->restaurant_id)->first();
  //     if ($restaurant) {
  //       $category_restaurant = Res_Cat::create([
  //         'restaurant_id' => $request->restaurant_id,
  //         'category_id' => $request->Category_id
  //       ]);
  //       return response()->json([
  //         'message' => 'Category added successfully',
  //         'category_restaurant' => $category_restaurant
  //       ], 200);
  //     } else {
  //       return response()->json([
  //         'message' => 'Restaurant not found'
  //       ], 404);
  //     }
  //   } else {
  //     return response()->json([
  //       'message' => 'Category not found'
  //     ], 404);
  //   }
  // }




  public function CreateCategoryinRes(Request $request)
  {
    $request->validate([
      'Category_id' => ['required']
    ], [
      'Category_id.required' => 'Category id is required'
    ]);

    $user = auth()->user();
    if (!$user) {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    $restaurantId = null;

    // الحالة الأولى: Manager
    if ($user->role === 'Manager') {
      $restaurant = Reastaurant::where('user_id', $user->id)->first();
      if (!$restaurant) {
        return response()->json(['message' => 'Restaurant record not found'], 404);
      }
      $restaurantId = $restaurant->id;
    }
    // الحالة الثانية: Employee
    elseif ($user->role === 'Employee') {
      $employee = Employees::where('user_id', $user->id)->first();
      if (!$employee) {
        return response()->json(['message' => 'Employee record not found'], 404);
      }
      $restaurantId = $employee->restaurant_id;
    } else {
      return response()->json(['message' => 'Unauthorized role'], 403);
    }

    // التحقق من وجود الكاتيجوري
    $category = Categories::find($request->Category_id);
    if (!$category) {
      return response()->json(['message' => 'Category not found'], 404);
    }

    // إنشاء الربط بين المطعم والكاتيجوري
    $category_restaurant = Res_Cat::create([
      'restaurant_id' => $restaurantId,
      'category_id'   => $request->Category_id
    ]);

    return response()->json([
      'message' => 'Category added successfully',
      'category_restaurant' => $category_restaurant
    ], 200);
  }






  // public function GetCategories($id)
  // {
  //   // جلب جميع السجلات المرتبطة بالمطعم المحدد مع التصنيفات المرتبطة
  //   $categories = Res_Cat::with('category')
  //     ->where('restaurant_id', $id)
  //     ->get();

  //   // إذا لم يتم العثور على أي سجلات
  //   if ($categories->isEmpty()) {
  //     return response()->json([
  //       'message' => 'No categories found for this restaurant'
  //     ], 404);
  //   }


  //   return response()->json(
  //     $categories
  //   );

  // }

  public function GetCategories()
  {
    $user = Auth::user();

    if ($user['role'] == 'Manager' || $user['role'] == 'Employee') {

      // تحديد المطعم حسب الدور
      if ($user['role'] == 'Manager') {
        $restaurant = Reastaurant::where('user_id', $user->id)->first();
      } else {
        $employee = Employees::where('user_id', $user->id)->first();
        $restaurant = Reastaurant::find($employee->reastaurant_id ?? null);
      }

      if (!$restaurant) {
        return response()->json([
          'message' => 'No restaurant found for this user'
        ], 404);
      }

      // جلب التصنيفات المرتبطة بالمطعم
      $categories = Res_Cat::with('category')
        ->where('restaurant_id', $restaurant->id)
        ->get();

      if ($categories->isEmpty()) {
        return response()->json([
          'message' => 'No categories found for this restaurant'
        ], 404);
      }

      return response()->json($categories);
    }

    return response()->json(['message' => 'You are not authorized to view this data'], 403);
  }


  public function deleteCatigoryinres($id)
  {
    $res = Res_Cat::where('id', $id)->delete();
    if ($res) {
      return response()->json([
        'message' => 'Category deleted successfully'
      ], 200);
    } else {
      return response()->json([
        'message' => 'Category not found'
      ], 404);
    }
  }

  public function deleteCategory($id)
  {
    $restaurant = Res_Cat::query()->where('id', $id)->delete();
    if ($restaurant) {
      return response()->json([
        'message' => 'Category deleted successfully'
      ], 200);
    } else {
      return response()->json([
        'message' => 'Category not found'
      ], 404);
    }
  }

  public function GetReviewToRes($id)
  {
    $reviews = Review::query()->where('restaurant_id', $id)->get();
    if ($reviews->isNotEmpty()) {
      return response()->json([
        'reviews' => $reviews
      ]);
    } else {
      return response()->json([
        'message' => 'No reviews found'
      ], 404);
    }
  }

  public function GetAllEmployee()
  {
    $employees = Employees::with(['user', 'job', 'restaurant'])->get();

    if ($employees->isNotEmpty()) {
      $employees = $employees->map(function ($employee) {
        return [
          'id' => $employee->id,
          'user_id' => $employee->user_id,
          'user_name' => $employee->user->username ?? null,
          'job_id' => $employee->job_id,
          'job_name' => $employee->job->name ?? null,
          'restaurant_id' => $employee->reastaurant_id,
          'restaurant_name' => $employee->restaurant->name ?? null,
          'created_at' => $employee->created_at,
          'updated_at' => $employee->updated_at,
        ];
      });

      return response()->json(['employees' => $employees]);
    } else {
      return response()->json(['message' => 'No employees found'], 404);
    }
  }
  public function GetAllJop()
  {
    $jobs = Jobs::all();
    if ($jobs) {
      return response()->json([
        'jobs' => $jobs
      ]);
    } else {
      return response()->json([
        'message' => 'No jobs found'
      ], 404);
    }
  }

  // public function GetFoodDiscount()
  // {
  //   $user = Auth::user();

  //   if ($user->role == 'Manager' || $user->role == 'Employee') {

  //     // تحديد المطعم حسب الدور
  //     if ($user->role == 'Manager') {
  //       $restaurant = Reastaurant::where('user_id', $user->id)->first();
  //     } else {
  //       $employee = Employees::where('user_id', $user->id)->first();
  //       $restaurant = Reastaurant::find($employee->reastaurant_id ?? null);
  //     }

  //     if ($restaurant) {
  //       $foodRestaurant = Food::where('reastaurants_id', $restaurant->id)
  //         ->where('discount', '!=', 1)
  //         ->get()
  //         ->map(function ($food) {
  //           // تعديل قيمة image لتكون رابط كامل
  //           $food->image = asset('storage/' . $food->image);
  //           return $food;
  //         });

  //       return response()->json([
  //         'food' => $foodRestaurant
  //       ]);
  //     } else {
  //       return response()->json([
  //         'message' => 'لم يتم العثور على المطعم'
  //       ], 404);
  //     }
  //   }

  //   return response()->json([
  //     'message' => 'صلاحيات غير كافية'
  //   ], 403);
  // }

  public function GetFoodDiscount()
  {
    $user = Auth::user();

    if ($user->role == 'Manager' || $user->role == 'Employee') {

      // تحديد المطعم حسب الدور
      if ($user->role == 'Manager') {
        $restaurant = Reastaurant::where('user_id', $user->id)->first();
      } else {
        $employee = Employees::where('user_id', $user->id)->first();
        $restaurant = Reastaurant::find($employee->reastaurant_id ?? null);
      }

      if ($restaurant) {
        $foodRestaurant = Food::where('reastaurants_id', $restaurant->id)
          ->where('discount', '!=', 1)
          ->get()
          ->map(function ($food) {
            // جلب اسم التصنيف
            $categoryName = Categories::find($food->categories_id)?->name;

            return [
              'id' => $food->id,
              'name' => $food->name,
              'price' => $food->price,
              'discription' => $food->discription,
              'categories_id' => $food->categories_id,
              'category_name' => $categoryName,
              'reastaurants_id' => $food->reastaurants_id,
              'discount' => $food->discount,
              'time-to-make' => $food->{'time-to-make'},
              'image' => asset('storage/' . $food->image),
              'created_at' => $food->created_at,
              'updated_at' => $food->updated_at,
            ];
          });

        return response()->json([
          'food' => $foodRestaurant
        ]);
      } else {
        return response()->json([
          'message' => 'لم يتم العثور على المطعم'
        ], 404);
      }
    }

    return response()->json([
      'message' => 'صلاحيات غير كافية'
    ], 403);
  }
}
