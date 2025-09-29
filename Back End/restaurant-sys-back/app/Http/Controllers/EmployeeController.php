<?php

namespace App\Http\Controllers;

use App\Models\Categories;
use App\Models\Complaints;
use App\Models\Customer;
use App\Models\EmployeeCustomer;
use App\Models\Employees;
use App\Models\Food;
use App\Models\listorder;
use App\Models\listorderItem;
use App\Models\Order;
use App\Models\Parking;
use App\Models\Reastaurant;
use App\Models\Tables;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

use function PHPUnit\Framework\isEmpty;

class EmployeeController extends Controller
{
  // public function CreateComplain(Request $request, $id)
  // {
  //   $restaurant = Reastaurant::find($id);
  //   if ($restaurant) {
  //     $request->validate([
  //       'discription' => ['required', 'string', 'max:30'],
  //       'context' => ['required'],
  //     ], [
  //       'discription.required' => 'Please enter the description',
  //       'discription.string' => 'Please enter the description',
  //     ]);
  //     $complain = Complaints::create([
  //       'discription' => $request['discription'],
  //       'context' => $request['context'],
  //       'reastaurant_id' => $id,
  //     ]);

  //     return response()->json(['message' => 'Complain created successfully', 'data' => $complain]);
  //   }

  //   return response()->json([
  //     'message' => 'Restaurant not found',
  //   ], 200);
  // }


  public function CreateComplain(Request $request)
  {
    // جلب المستخدم الحالي
    $user = Auth::user();

    if (!$user) {
      return response()->json([
        'message' => 'User not authenticated',
      ], 401);
    }

    // جلب الموظف المرتبط بالمستخدم
    $employee = Employees::where('user_id', $user->id)->first();

    if (!$employee) {
      return response()->json([
        'message' => 'Employee record not found for this user',
      ], 404);
    }

    // جلب المطعم المرتبط بالموظف
    $restaurant = Reastaurant::find($employee->reastaurant_id);
    if (!$restaurant) {
      return response()->json([
        'message' => 'Restaurant not found',
      ], 404);
    }

    // التحقق من البيانات
    $request->validate([
      'discription' => ['required', 'string', 'max:30'],
      'context' => ['required'],
    ], [
      'discription.required' => 'Please enter the description',
      'discription.string' => 'Please enter the description',
    ]);

    // إنشاء الشكوى
    $complain = Complaints::create([
      'discription' => $request->input('discription'),
      'context' => $request->input('context'),
      'reastaurant_id' => $restaurant->id,
    ]);

    return response()->json([
      'message' => 'Complain created successfully',
      'data' => $complain
    ]);
  }



  public function updateTable($id)
  {
    $table = Tables::find($id); // Retrieve the table by ID

    if ($table) {
      // Toggle the status
      $table->status = ($table->status === 'vacant') ? 'reserved' : 'vacant';
      $table->save(); // Save the changes

      return response()->json(['message' => 'Table status updated successfully', 'status' => $table->status]);
    }

    return response()->json(['message' => 'Table not found'], 404);
  }

  // public function CreateFood(Request $request)  
  // {    
  //     $user = Auth::user();    

  //     if ($user['role'] == 'Manager' || $user['role'] == 'Employee') {      
  //         $request->validate([
  //             'name' => ['required', 'string', 'max:30'],
  //             'price' => ['required', 'numeric'],
  //             'discription' => ['required', 'string', 'max:100'],
  //             'categories_id' => ['required'],
  //             'reastaurants_id' => ['required'],
  //             'time-to-make' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'],
  //             'discount'=>['nullable'],
  //             'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'] // استقبال الصورة كملف
  //         ], [
  //             'image.required' => 'Please upload an image',
  //             'image.file' => 'The image must be a valid file',
  //             'image.image' => 'The file must be an image',
  //             'image.mimes' => 'Only JPG, JPEG, and PNG formats are allowed',
  //             'image.max' => 'Image size should not exceed 2MB'
  //         ]);

  //         // التحقق إذا كان الطعام موجودًا بالفعل
  //         $existingFood = Food::where('name', $request['name'])
  //             ->where('reastaurants_id', $request['reastaurants_id'])
  //             ->first();   

  //         if ($existingFood) {          
  //             return response()->json(['message' => 'Food item already exists in this restaurant'], 400);        
  //         }

  //         // حفظ الصورة في مجلد التخزين
  //         $imagePath = $request->file('image')->store('food_images', 'public');


  //         // إنشاء الطعام
  //         $food = Food::create([
  //             'name' => $request['name'],
  //             'price' => $request['price'],
  //             'discription' => $request['discription'],
  //             'categories_id' => $request['categories_id'],
  //             'reastaurants_id' => $request['reastaurants_id'],
  //             'time-to-make' => $request['time-to-make'],
  //             'discount' =>isEmpty($request['discount'])?$request['discount']:1,
  //             'image' => $imagePath, // حفظ مسار الصورة في قاعدة البيانات
  //         ]);

  //         return response()->json([
  //             'message' => 'Food created successfully',
  //             'food' => [
  //                 'id' => $food->id,
  //                 'name' => $food->name,
  //                 'price' => $food->price,
  //                 'discription' => $food->discription,
  //                 'categories_id' => $food->categories_id,
  //                 'reastaurants_id' => $food->reastaurants_id,
  //                 'time-to-make' => $food->{"time-to-make"},
  //                 'discount' => $food->discount,
  //                 'image_url' => asset('storage/' . $food->image) // إرجاع رابط الصورة ليتمكن الـ Frontend من عرضها
  //             ]
  //         ]);
  //     }    

  //     return response()->json(['message' => 'You are not authorized to create food'], 403);    
  // }


  public function CreateFood(Request $request)
  {
    $user = Auth::user();

    if ($user['role'] == 'Manager' || $user['role'] == 'Employee') {

      // التحقق من المدخلات بدون reastaurants_id
      $request->validate([
        'name' => ['required', 'string', 'max:30'],
        'price' => ['required', 'numeric'],
        'discription' => ['required', 'string', 'max:100'],
        'categories_id' => ['required'],
        'time-to-make' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'],
        'discount' => ['nullable'],
        'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048']
      ], [
        'image.required' => 'Please upload an image',
        'image.file' => 'The image must be a valid file',
        'image.image' => 'The file must be an image',
        'image.mimes' => 'Only JPG, JPEG, and PNG formats are allowed',
        'image.max' => 'Image size should not exceed 2MB'
      ]);

      // تحديد الـ restaurant_id بناءً على دور المستخدم
      if ($user['role'] == 'Manager') {
        $restaurant = Reastaurant::where('user_id', $user->id)->first();
      } else { // Employee
        $employee = Employees::where('user_id', $user->id)->first();
        $restaurant = Reastaurant::find($employee->reastaurant_id ?? null);
      }

      if (!$restaurant) {
        return response()->json(['message' => 'No restaurant found for this user'], 404);
      }

      $restaurant_id = $restaurant->id;

      // التحقق إذا كان الطعام موجود بالفعل
      $existingFood = \App\Models\Food::where('name', $request['name'])
        ->where('reastaurants_id', $restaurant_id)
        ->first();

      if ($existingFood) {
        return response()->json(['message' => 'Food item already exists in this restaurant'], 400);
      }

      // حفظ الصورة
      $imagePath = $request->file('image')->store('food_images', 'public');

      // إنشاء الطعام
      $food = \App\Models\Food::create([
        'name' => $request['name'],
        'price' => $request['price'],
        'discription' => $request['discription'],
        'categories_id' => $request['categories_id'],
        'reastaurants_id' => $restaurant_id,
        'time-to-make' => $request['time-to-make'],
        'discount' => empty($request['discount']) ? null : $request['discount'],
        'image' => $imagePath,
      ]);

      return response()->json([
        'message' => 'Food created successfully',
        'food' => [
          'id' => $food->id,
          'name' => $food->name,
          'price' => $food->price,
          'discription' => $food->discription,
          'categories_id' => $food->categories_id,
          'reastaurants_id' => $food->reastaurants_id,
          'time-to-make' => $food->{"time-to-make"},
          'discount' => $food->discount,
          'image_url' => asset('storage/' . $food->image)
        ]
      ]);
    }

    return response()->json(['message' => 'You are not authorized to create food'], 403);
  }


  // public function UpdateFood(Request $request, $id)
  // {
  //   $user = Auth::user();

  //   if ($user['role'] != 'Manager' && $user['role'] != 'Employee') {
  //     return response()->json(['message' => 'You are not authorized to update food'], 403);
  //   }

  //   $food = Food::find($id);

  //   if (!$food) {
  //     return response()->json(['message' => 'Food item not found'], 404);
  //   }

  //   $validatedData = $request->validate([
  //     'name' => ['nullable', 'string', 'max:30'],
  //     'price' => ['nullable', 'numeric'],
  //     'discription' => ['nullable', 'string', 'max:100'],
  //     'categories_id' => ['nullable'],
  //     'reastaurants_id' => ['nullable'],
  //     'time-to-make' => ['nullable', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'],
  //     'discount' => ['nullable']
  //   ], [
  //     'name.string' => 'Please enter a valid name',
  //     'price.numeric' => 'Please enter the price as a number',
  //     'discription.string' => 'Please enter a valid description',
  //     'time-to-make.regex' => 'Please enter the time in the correct format'
  //   ]);

  //   // تحديث فقط القيم التي تم إرسالها وكانت غير فارغة أو غير مساوية للقيم القديمة
  //   $updatedFields = [];
  //   foreach ($validatedData as $key => $value) {
  //     if ($request->has($key)) {
  //       if ($value !== null && $value !== "" && $value != $food[$key]) {
  //         $updatedFields[$key] = $value;
  //       } else {
  //         $updatedFields[$key] = $food[$key]; // الاحتفاظ بالقيمة القديمة
  //       }
  //     }
  //   }

  //   if (empty($updatedFields)) {
  //     return response()->json(['message' => 'No changes detected'], 400);
  //   }

  //   $food->update($updatedFields);

  //   return response()->json([
  //     'message' => 'Food updated successfully',
  //     'food' => $food
  //   ]);
  // }


  public function UpdateFood(Request $request, $id)
  {
    $user = Auth::user();

    if ($user['role'] != 'Manager' && $user['role'] != 'Employee') {
      return response()->json(['message' => 'You are not authorized to update food'], 403);
    }

    $food = Food::find($id);

    if (!$food) {
      return response()->json(['message' => 'Food item not found'], 404);
    }

    $validatedData = $request->validate([
      'name' => ['nullable', 'string', 'max:30'],
      'price' => ['nullable', 'numeric'],
      'discription' => ['nullable', 'string', 'max:100'],
      'categories_id' => ['nullable'],
      'reastaurants_id' => ['nullable'],
      'time-to-make' => ['nullable', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/'],
      'discount' => ['nullable'],
      'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048']
    ], [
      'name.string' => 'Please enter a valid name',
      'price.numeric' => 'Please enter the price as a number',
      'discription.string' => 'Please enter a valid description',
      'time-to-make.regex' => 'Please enter the time in the correct format',
      'image.file' => 'The image must be a valid file',
      'image.image' => 'The file must be an image',
      'image.mimes' => 'Only JPG, JPEG, and PNG formats are allowed',
      'image.max' => 'Image size should not exceed 2MB'
    ]);

    $updatedFields = [];

    // معالجة النصوص والأرقام
    foreach ($validatedData as $key => $value) {
      if ($key !== 'image' && $request->has($key)) {
        if ($value !== null && $value !== "" && $value != $food[$key]) {
          $updatedFields[$key] = $value;
        }
      }
    }

    // معالجة الصورة
    if ($request->hasFile('image')) {
      // حذف الصورة القديمة
      if ($food->image && Storage::disk('public')->exists($food->image)) {
        Storage::disk('public')->delete($food->image);
      }

      // حفظ الصورة الجديدة
      $imagePath = $request->file('image')->store('food_images', 'public');
      $updatedFields['image'] = $imagePath;
    }

    if (empty($updatedFields)) {
      return response()->json(['message' => 'No changes detected'], 400);
    }

    $food->update($updatedFields);

    return response()->json([
      'message' => 'Food updated successfully',
      'food' => [
        'id' => $food->id,
        'name' => $food->name,
        'price' => $food->price,
        'discription' => $food->discription,
        'categories_id' => $food->categories_id,
        'reastaurants_id' => $food->reastaurants_id,
        'time-to-make' => $food->{"time-to-make"},
        'discount' => $food->discount,
        'image_url' => asset('storage/' . $food->image)
      ]
    ]);
  }


  public function deleteFood($id)
  {
    $food = Food::where('id', '=', $id)->first();
    if (!$food) {
      return response()->json(['message' => 'Food item not found'], 404);
    }
    $food->delete();
    return response()->json(['message' => 'Food deleted successfully']);
  }

  // get food in restaurant
  // public function getFoodInRestaurant($id)
  // {
  //   $food = Food::where('reastaurants_id', '=', $id)->get();
  //   return response()->json(['food' => $food]);
  // }

  // public function getFoodInRestaurant()
  // {
  //     $user = Auth::user();

  //     if ($user['role'] == 'Manager' || $user['role'] == 'Employee') {

  //         // تحديد المطعم
  //         if ($user['role'] == 'Manager') {
  //             $restaurant =Reastaurant::where('user_id', $user->id)->first();
  //         } else { // Employee
  //             $employee = Employees::where('user_id', $user->id)->first();
  //             $restaurant =Reastaurant::find($employee->reastaurant_id ?? null);
  //         }

  //         if (!$restaurant) {
  //             return response()->json(['message' => 'No restaurant found for this user'], 404);
  //         }

  //         // جلب الأكلات
  //         $food = Food::where('reastaurants_id', $restaurant->id)->get();

  //         // تعديل قيمة image لتكون رابط جاهز
  //         $food->transform(function ($item) {
  //             $item->image = asset('storage/' . $item->image);
  //             return $item;
  //         });

  //         return response()->json(['food' => $food]);
  //     }

  //     return response()->json(['message' => 'You are not authorized to view this data'], 403);
  // }

  public function getFoodInRestaurant()
  {
    $user = Auth::user();

    if ($user['role'] == 'Manager' || $user['role'] == 'Employee') {

      // تحديد المطعم
      if ($user['role'] == 'Manager') {
        $restaurant = Reastaurant::where('user_id', $user->id)->first();
      } else {
        $employee = Employees::where('user_id', $user->id)->first();
        $restaurant = Reastaurant::find($employee->reastaurant_id ?? null);
      }

      if (!$restaurant) {
        return response()->json(['message' => 'No restaurant found for this user'], 404);
      }

      // جلب الأكلات بدون علاقة
      $food = Food::where('reastaurants_id', $restaurant->id)->get()
        ->map(function ($item) {
          $categoryName = Categories::find($item->categories_id)?->name;

          return [
            'id' => $item->id,
            'name' => $item->name,
            'price' => $item->price,
            'discription' => $item->discription,
            'categories_id' => $item->categories_id,
            'category_name' => $categoryName,
            'reastaurants_id' => $item->reastaurants_id,
            'discount' => $item->discount,
            'time-to-make' => $item->{'time-to-make'},
            'image' => asset('storage/' . $item->image),
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
          ];
        });

      return response()->json(['food' => $food]);
    }

    return response()->json(['message' => 'You are not authorized to view this data'], 403);
  }

  // public function EditOrder($id)
  // {
  //   $user = Auth::user();

  //   // التحقق من صلاحية المستخدم
  //   if (strtolower($user->role) === 'employee') {

  //     $order = Order::find($id);

  //     if (!$order) {
  //       return response()->json(['message' => 'Order not found'], 404);
  //     }

  //     // التحقق من الحالة الحالية وتغييرها
  //     if ($order->status === 'pending') {
  //       $order->status = 'making';
  //     } elseif ($order->status === 'making') {
  //       $order->status = 'done';
  //     } elseif ($order->status === 'done') {
  //       return response()->json(['message' => 'Order is already done'], 400);
  //     } else {
  //       return response()->json(['message' => 'Unknown order status'], 400);
  //     }

  //     $order->save();

  //     return response()->json([
  //       'message' => 'Order status updated successfully',
  //       'order' => $order
  //     ], 200);
  //   }

  //   return response()->json(
  //     ['message' => 'You are not authorized to perform this action'],
  //     403
  //   );
  // }





  //   public function getOrderDetails($id) {
  //     // جلب الطلب بناءً على ID القادم من الهيدر
  //     $order = Order::where('id', $id)->first();

  //     if (!$order) {
  //         return response()->json(['message' => 'Order not found'], 404);
  //     }

  //     // جلب قائمة الطلبات المرتبطة بالطلب
  //     $list = listorder::where('id', $order->listorders_id)->first();

  //     if (!$list) {
  //         return response()->json(['message' => 'List not found for this order'], 404);
  //     }

  //     // جلب جميع العناصر المرتبطة بالقائمة
  //     $listItems = listorderItem::where('listorders_id', $list->id)->get();

  //     if ($listItems->isEmpty()) {
  //         return response()->json(['message' => 'No items found in the list'], 400);
  //     }

  //     // ترتيب البيانات مع جميع تفاصيل الطعام والكمية والوصف
  //     $formattedItems = $listItems->map(function ($item) {
  //         $food = Food::find($item->food_id);
  //         return [
  //             'food_name' => $food ? $food->name : 'Unknown',
  //             'quantity' => $item->quantity,
  //             'description' => $item->description,
  //         ];
  //     });

  //     return response()->json([
  //         'order_id' => $order->id,
  //         'items' => $formattedItems,
  //     ], 200);
  // }



  public function EditOrder($id)
  {
    $user = Auth::user();

    // التحقق من صلاحية المستخدم
    if (strtolower($user->role) === 'employee') {

      $order = Order::find($id);

      if (!$order) {
        return response()->json(['message' => 'Order not found'], 404);
      }

      // التحقق من الحالة الحالية وتغييرها
      if ($order->status === 'pending') {
        $order->status = 'making';
      } elseif ($order->status === 'making') {
        $order->status = 'done';
      } elseif ($order->status === 'done') {
        // نجيب بيانات الموظف
        $employee = Employees::where('user_id', $user->id)->first();

        if ($employee && $employee->job_id == 1) {
          // يسمح له يغير من done → تم التسليم
          $order->status = 'تم التسليم';
        } else {
          return response()->json(['message' => 'Order is already done'], 400);
        }
      } else {
        return response()->json(['message' => 'Unknown order status'], 400);
      }

      $order->save();

      return response()->json([
        'message' => 'Order status updated successfully',
        'order' => $order
      ], 200);
    }

    return response()->json(
      ['message' => 'You are not authorized to perform this action'],
      403
    );
  }

  public function getOrderDetails($id)
  {
    // جلب الطلب بناءً على ID القادم من الهيدر
    $order = Order::where('id', $id)->first();

    if (!$order) {
      return response()->json(['message' => 'Order not found'], 404);
    }

    // جلب قائمة الطلبات المرتبطة بالطلب
    $list = ListOrder::where('id', $order->listorders_id)->first();

    if (!$list) {
      return response()->json(['message' => 'List not found for this order'], 404);
    }

    // جلب بيانات الكستومر لإيجاد رقم الطاولة
    $customer = Customer::where('id', $list->customer_id)->first();

    if (!$customer) {
      return response()->json(['message' => 'Customer not found'], 404);
    }

    // جلب جميع العناصر المرتبطة بالقائمة
    $listItems = ListOrderItem::where('listorders_id', $list->id)->get();

    if ($listItems->isEmpty()) {
      return response()->json(['message' => 'No items found in the list'], 400);
    }

    // ترتيب البيانات مع جميع تفاصيل الطعام والكمية والوصف
    $formattedItems = $listItems->map(function ($item) {
      $food = Food::find($item->food_id);
      return [
        'food_name' => $food ? $food->name : 'Unknown',
        'quantity' => $item->quantity,
        'description' => $item->description,
      ];
    });

    return response()->json([
      'order_id' => $order->id,
      'status' => $order->status,
      'time_to_make' => $order['time-to-make'],
      'table_id' => $customer->table_id, // جلب رقم الطاولة من جدول Customer
      'items' => $formattedItems,
    ], 200);
  }

  // public function getAllOrders()
  // {
  //   // جلب جميع الطلبات
  //   $orders = Order::all();

  //   if ($orders->isEmpty()) {
  //     return response()->json(['message' => 'No orders found'], 404);
  //   }

  //   // تجهيز البيانات لكل طلب
  //   $formattedOrders = $orders->map(function ($order) {
  //     // جلب القائمة المرتبطة بالطلب
  //     $list = ListOrder::where('id', $order->listorders_id)->first();

  //     if (!$list) return null;

  //     // جلب بيانات العميل لإيجاد رقم الطاولة
  //     $customer = Customer::where('id', $list->customer_id)->first();
  //     $table_id = $customer ? $customer->table_id : null;

  //     // جلب جميع العناصر المرتبطة بالقائمة
  //     $listItems = ListOrderItem::where('listorders_id', $list->id)->get();

  //     // تجهيز بيانات الأطعمة لكل طلب
  //     $items = $listItems->map(function ($item) {
  //       $food = Food::find($item->food_id);
  //       return [
  //         'food_name' => $food ? $food->name : 'Unknown',
  //         'quantity' => $item->quantity,
  //         'description' => $item->description,
  //       ];
  //     });

  //     return [
  //       'order_id' => $order->id,
  //       'table_id' => $table_id,
  //       'items' => $items,
  //     ];
  //   })->filter(); // استبعاد الطلبات غير الصالحة (التي لا تحتوي على قائمة طلبات)

  //   return response()->json($formattedOrders, 200);
  // }



  // public function getAllOrders()
  // {
  //   // جلب المستخدم الحالي
  //   $user = Auth::user();

  //   // إيجاد الموظف المرتبط بالمستخدم
  //   $employee = Employees::where('user_id', $user->id)->first();
  //   if (!$employee) {
  //     return response()->json(['message' => 'Employee not found'], 404);
  //   }

  //   $restaurantId = $employee->reastaurant_id;

  //   // جلب الطلبات المرتبطة بالمطعم عبر join يدوي
  //   $orders = Order::join('listorders', 'orders.listorders_id', '=', 'listorders.id')
  //     ->join('customers', 'listorders.customer_id', '=', 'customers.id')
  //     ->join('tables', 'customers.table_id', '=', 'tables.id')
  //     ->where('tables.reastaurants_id', $restaurantId)
  //     ->select('orders.*') // نختار أعمدة orders فقط
  //     ->get();

  //   if ($orders->isEmpty()) {
  //     return response()->json(['message' => 'No orders found for this restaurant'], 404);
  //   }

  //   // تجهيز البيانات لكل طلب
  //   $formattedOrders = $orders->map(function ($order) {
  //     $list = Listorder::where('id', $order->listorders_id)->first();
  //     if (!$list) return null;

  //     $customer = Customer::where('id', $list->customer_id)->first();
  //     $table_id = $customer ? $customer->table_id : null;

  //     $listItems = ListorderItem::where('listorders_id', $list->id)->get();

  //     $items = $listItems->map(function ($item) {
  //       $food = Food::find($item->food_id);
  //       return [
  //         'food_name'   => $food ? $food->name : 'Unknown',
  //         'quantity'    => $item->quantity,
  //         'description' => $item->description,
  //       ];
  //     });

  //     return [
  //       'order_id'     => $order->id,
  //       'status'       => $order->status,
  //       'time_to_make' => $order['time-to-make'],
  //       'table_id'     => $table_id,
  //       'items'        => $items,
  //     ];
  //   })->filter();

  //   return response()->json($formattedOrders, 200);
  // }



  public function getAllOrders()
  {
    // جلب المستخدم الحالي
    $user = Auth::user();

    // إيجاد الموظف المرتبط بالمستخدم
    $employee = Employees::where('user_id', $user->id)->first();
    if (!$employee) {
      return response()->json(['message' => 'Employee not found'], 404);
    }

    $restaurantId = $employee->reastaurant_id;

    // جلب الطلبات المرتبطة بالمطعم عبر join يدوي مع رقم الطاولة
    $orders = Order::join('listorders', 'orders.listorders_id', '=', 'listorders.id')
      ->join('customers', 'listorders.customer_id', '=', 'customers.id')
      ->join('tables', 'customers.table_id', '=', 'tables.id')
      ->where('tables.reastaurants_id', $restaurantId)
      ->select('orders.*', 'tables.table_number') // إضافة رقم الطاولة
      ->get();

    if ($orders->isEmpty()) {
      return response()->json(['message' => 'No orders found for this restaurant'], 404);
    }

    // تجهيز البيانات لكل طلب
    $formattedOrders = $orders->map(function ($order) {
      $list = Listorder::where('id', $order->listorders_id)->first();
      if (!$list) return null;

      $customer = Customer::where('id', $list->customer_id)->first();
      $table_id = $customer ? $customer->table_id : null;
      $table_number = $order->table_number ?? null; // رقم الطاولة من الـ join

      $listItems = ListorderItem::where('listorders_id', $list->id)->get();

      $items = $listItems->map(function ($item) {
        $food = Food::find($item->food_id);
        return [
          'food_name'   => $food ? $food->name : 'Unknown',
          'quantity'    => $item->quantity,
          'description' => $item->description,
        ];
      });

      return [
        'order_id'     => $order->id,
        'status'       => $order->status,
        'time_to_make' => $order['time-to-make'],
        'table_id'     => $table_id,
        'table_number' => $table_number,
        'items'        => $items,
      ];
    })->filter();

    return response()->json($formattedOrders, 200);
  }

  // public function CreateParking(Request $request)
  // {
  //   $request->validate([
  //     'n-car' => ['required'],
  //     'discription' => ['nullable'],
  //   ], [
  //     'n-car.required' => 'You should enter InDash Car',
  //   ]);

  //   // توليد QR Code بصيغة HTTP
  //   do {
  //     $qrCode = rand(100000, 999999);
  //   } while (Parking::where('Qr-CODE', $qrCode)->exists());

  //   // Check if the n-car already exists
  //   if (Parking::where('n-car', $request['n-car'])->exists()) {
  //     return response()->json(['message' => 'The car is already parked.'], 400);
  //   }

  //   $parking = Parking::create([
  //     'n-car' => $request['n-car'],
  //     'discription' => !empty($request->discription) ? $request->discription : 'no discription',
  //     'status' => 'parked',
  //     'Qr-CODE' => $qrCode,
  //   ]);

  //   return response()->json([
  //     'message' => 'Parking created successfully',
  //     'parking' => $parking
  //   ], 201);
  // }


  public function CreateParking(Request $request)
  {
    $request->validate([
      'n-car' => 'required|string',
      'description' => 'nullable|string',
    ]);

    $user = Auth::user();

    // جلب restaurant_id من جدول employees بناءً على المستخدم الحالي
    $employee = Employees::where('user_id', $user->id)->first();

    if (!$employee) {
      return response()->json(['error' => 'No restaurant found for this user.'], 404);
    }

    // إنشاء صف جديد في جدول parkings
    $parking = Parking::create([
      'n-car' => $request['n-car'],
      'discription' => $request->filled('description') ? $request->description : 'no description',
      'status' => 'parked',
      'restaurant_id' => $employee->reastaurant_id,
    ]);

    return response()->json(['message' => 'Parking created successfully.', 'data' => $parking], 201);
  }


  public function UpdateParkingStatus($n_car)
  {
    // البحث عن السيارة حسب رقمها
    $parking = Parking::where('n-car', $n_car)->first();

    if (!$parking) {
      return response()->json(['error' => 'Car not found.'], 404);
    }

    // التبديل بين الحالات
    if ($parking->status === 'parked') {
      $parking->status = 'being_fetched'; // يتم الإحضار
    } elseif ($parking->status === 'being_fetched') {
      $parking->status = 'delivered'; // تم التسليم
    } else {
      return response()->json(['message' => 'This car is already delivered.'], 200);
    }

    $parking->save();

    return response()->json([
      'message' => 'Parking status updated successfully.',
      'data' => $parking
    ], 200);
  }


  public function deleteCar($id)
  {
    $parking = Parking::find($id);
    if (!$parking) {
      return response()->json(['message' => 'Parking not found'], 404);
    }
    $parking->delete();
    return response()->json(['message' => 'Parking deleted successfully'], 200);
  }

  public function GetRestaurantParkings()
  {
    $user = Auth::user();

    $employee = Employees::where('user_id', $user->id)->first();

    if (!$employee) {
      return response()->json(['error' => 'No restaurant found for this user.'], 404);
    }

    $parkings = Parking::where('restaurant_id', $employee->reastaurant_id)->get();

    return response()->json([
      'message' => 'All parkings for this restaurant.',
      'data' => $parkings
    ], 200);
  }


  // public function getInvoice($id)
  // {
  //   $customer = Customer::where('table_id', $id)->first();
  //   if (!$customer) {
  //     return response()->json(['message' => 'Customer not found'], 404);
  //   }

  //   $customerId = $customer->id;

  //   // جلب كل الـ lists الخاصة بالمستخدم
  //   $lists = listorder::where('customer_id', $customerId)->get();

  //   if ($lists->isEmpty()) {
  //     return response()->json(['message' => 'لا يوجد قوائم طلبات لهذا المستخدم'], 404);
  //   }

  //   $invoices = [];

  //   foreach ($lists as $list) {
  //     // جلب الطلبات المرتبطة بـ list_id
  //     $orders = Order::where('listorders_id', $list->id)->get();

  //     if ($orders->isEmpty()) {
  //       continue; // إذا ما في طلبات نكمل للـ list التالية
  //     }

  //     $invoice = [
  //       'customer_id' => $customerId,
  //       'list_id' => $list->id,
  //       'orders' => [],
  //       'total_price' => 0,
  //     ];

  //     $totalPrice = 0;

  //     foreach ($orders as $order) {
  //       $orderDetails = [
  //         'order_id' => $order->id,
  //         'status' => $order->status,
  //         'foods' => [],
  //         'order_total' => 0,
  //       ];

  //       $orderTotal = 0;

  //       // جلب الأطعمة من جدول pivot
  //       $foodItems = DB::table('listorder_items')
  //         ->where('listorders_id', $list->id)
  //         ->get();

  //       foreach ($foodItems as $foodItem) {
  //         $food = Food::find($foodItem->food_id);

  //         if ($food) {
  //           $foodDetail = [
  //             'food_id' => $food->id,
  //             'name' => $food->name,
  //             'quantity' => $foodItem->quantity,
  //             'price_per_unit' => $food->price,
  //             'total_price' => $foodItem->quantity * $food->price,
  //           ];

  //           $orderTotal += $foodDetail['total_price'];
  //           $orderDetails['foods'][] = $foodDetail;
  //         }
  //       }

  //       $orderDetails['order_total'] = $orderTotal;
  //       $totalPrice += $orderTotal;
  //       $invoice['orders'][] = $orderDetails;
  //     }

  //     $invoice['total_price'] = $totalPrice;
  //     $invoices[] = $invoice;
  //   }

  //   return response()->json($invoices);
  // }

  public function getInvoice($id)
  {
    // جلب الزبون حسب table_id
    $customer = Customer::where('table_id', $id)->first();
    if (!$customer) {
      return response()->json(['message' => 'Customer not found'], 404);
    }

    $customerId = $customer->id;

    // جلب كل الـ lists الخاصة بالمستخدم
    $lists = listorder::where('customer_id', $customerId)->get();

    if ($lists->isEmpty()) {
      return response()->json(['message' => 'لا يوجد قوائم طلبات لهذا المستخدم'], 404);
    }

    $allLists = [];
    $grandTotal = 0;

    foreach ($lists as $list) {
      // جلب الطلبات المرتبطة بـ list_id
      $orders = Order::where('listorders_id', $list->id)->get();

      if ($orders->isEmpty()) {
        continue; // إذا ما في طلبات نكمل للـ list التالية
      }

      $listData = [
        'list_id' => $list->id,
        'orders' => [],
        'list_total' => 0,
      ];

      $listTotal = 0;

      foreach ($orders as $order) {
        $orderDetails = [
          'order_id' => $order->id,
          'status' => $order->status,
          'foods' => [],
          'order_total' => 0,
        ];

        $orderTotal = 0;

        // جلب الأطعمة من جدول pivot
        $foodItems = DB::table('listorder_items')
          ->where('listorders_id', $list->id)
          ->get();

        foreach ($foodItems as $foodItem) {
          $food = Food::find($foodItem->food_id);

          if ($food) {
            $foodDetail = [
              'food_id' => $food->id,
              'name' => $food->name,
              'quantity' => $foodItem->quantity,
              'price_per_unit' => $food->price,
              'total_price' => $foodItem->quantity * $food->price,
            ];

            $orderTotal += $foodDetail['total_price'];
            $orderDetails['foods'][] = $foodDetail;
          }
        }

        $orderDetails['order_total'] = $orderTotal;
        $listTotal += $orderTotal;
        $listData['orders'][] = $orderDetails;
      }

      $listData['list_total'] = $listTotal;
      $grandTotal += $listTotal;
      $allLists[] = $listData;
    }

    // الشكل النهائي للفاتورة
    $result = [
      'customer' => [
        'id' => $customer->id,
        // 'name' => $customer->name ?? null,
        'table_id' => $customer->table_id,
      ],
      'lists' => $allLists,
      'grand_total' => $grandTotal,
    ];

    return response()->json($result);
  }

  // public function getRestaurantMessages()
  // {
  //   $user = Auth::user();

  //   if (!$user) {
  //     return response()->json(['error' => 'Unauthorized'], 401);
  //   }

  //   $employee = $user->employee;

  //   if (!$employee) {
  //     return response()->json(['error' => 'Employee not found for this user'], 404);
  //   }

  //   $restaurantId = $employee->restaurant_id ?? $employee->reastaurant_id;

  //   if (!$restaurantId) {
  //     return response()->json(['error' => 'Restaurant not found for this employee'], 404);
  //   }

  //   $messages = EmployeeCustomer::where('restaurant_id', $restaurantId)
  //     ->with('customer')
  //     ->latest()
  //     ->get();

  //   return response()->json([
  //     'success' => true,
  //     'data'    => $messages
  //   ]);
  // }

  public function getRestaurantMessages()
  {
    $user = Auth::user();

    if (!$user) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }

    $employee = $user->employee;

    if (!$employee) {
      return response()->json(['error' => 'Employee not found for this user'], 404);
    }

    $restaurantId = $employee->restaurant_id ?? $employee->reastaurant_id;

    if (!$restaurantId) {
      return response()->json(['error' => 'Restaurant not found for this employee'], 404);
    }

    // ✅ جلب الرسائل مع رقم الطاولة عبر join
    $messages = DB::table('employee_customer')
      ->join('customers', 'employee_customer.customer_id', '=', 'customers.id')
      ->join('tables', 'customers.table_id', '=', 'tables.id')
      ->where('employee_customer.restaurant_id', $restaurantId)
      ->select(
        'employee_customer.id',
        'employee_customer.message',
        'employee_customer.customer_id',
        'employee_customer.restaurant_id',
        'tables.table_number',   // رقم الطاولة
        'employee_customer.created_at'
      )
      ->orderByDesc('employee_customer.created_at')
      ->get();

    return response()->json([
      'success' => true,
      'data'    => $messages
    ]);
  }


  public function deleteMessage($id)
  {
    // جلب الرسالة
    $message = EmployeeCustomer::find($id);

    if (!$message) {
      return response()->json([
        'error' => 'Message not found'
      ], 404);
    }

    // حذف الرسالة
    $message->delete();

    return response()->json([
      'success' => true,
      'message' => 'Message deleted successfully'
    ]);
  }
}
