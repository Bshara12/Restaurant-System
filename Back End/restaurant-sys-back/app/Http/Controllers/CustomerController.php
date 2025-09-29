<?php

namespace App\Http\Controllers;

use App\Models\Categories;
use App\Models\Customer;
use App\Models\EmployeeCustomer;
use App\Models\Employees;
use App\Models\Food;
use App\Models\listorder;
use App\Models\listorderItem;
use App\Models\Music;
use App\Models\Music_Table;
use App\Models\Order;
use App\Models\Order_Food;
use App\Models\Parking;
use App\Models\Reastaurant;
use App\Models\Review;
use App\Models\Tables;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
  // public function generateToken($id)
  // {
  //   $table = Tables::find($id);
  //   $restaurant_id = $table['reastaurants_id'];
  //   $status = $table['status'];

  //   // جيب اسم المطعم
  //   $restaurantName = Reastaurant::find($restaurant_id)->name ?? 'Unknown';

  //   // استقبل معرف الطاولة
  //   //تحقق مما إذا كان هناك جلسة نشطة لنفس الطاولة 
  //   $existingCustomer = Customer::where('table_id', $id)
  //     // لم يتم إنهاؤها بعد 
  //     ->first();
  //   if ($existingCustomer) {
  //     // إذا كان هناك جلسة فعالة، أعد نفس التوكن 
  //     $qrCodeUrl = url('/scan-login?token=' . $existingCustomer->token);
  //     $data = [];
  //     $data['qr_code_url'] = $qrCodeUrl;
  //     $data['customer'] = $existingCustomer;
  //     $data['restaurant'] = $restaurant_id;
  //     $data['restaurant_name'] = $restaurantName; // ← إضافة اسم المطعم
  //     return response()->json(['data' => $data]);
  //   }

  //   if ($status !== 'reserved') {
  //     $table->status = 'reserved';
  //     $table->save();

  //     // إنشاء توكن جديد فقط إذا لم يكن هناك جلسة نشطة 
  //     $token = bin2hex(random_bytes(16));
  //     $customer = Customer::create([
  //       'token' => $token,
  //       'table_id' => $id,
  //       'expires_at' => null,
  //       // لن ينتهي تلقائيًا، بل عند تغيير حالة الطاولة 
  //     ]);
  //     $qrCodeUrl = url('/scan-login?token=' . $token);
  //     $data = [];
  //     $data['qr_code_url'] = $qrCodeUrl;
  //     $data['customer'] = $customer;
  //     $data['restaurant'] = $restaurant_id;
  //     $data['restaurant_name'] = $restaurantName; // ← إضافة اسم المطعم
  //     return response()->json(['data' => $data]);
  //   } else {
  //     return response()->json(['message' => 'table is not available']);
  //   }
  // }


  public function generateToken($id)
  {
    $table = Tables::find($id);
    $restaurant_id = $table['reastaurants_id'];
    $status = $table['status'];

    // جيب اسم المطعم
    $restaurantName = Reastaurant::find($restaurant_id)->name ?? 'Unknown';

    // تحقق مما إذا كان هناك جلسة نشطة لنفس الطاولة 
    $existingCustomer = Customer::where('table_id', $id)->first();

    if ($existingCustomer) {
      // إذا كان هناك جلسة فعالة، أعد نفس التوكن 
      $qrCodeUrl = url('/scan-login?token=' . $existingCustomer->token);

      // تحديث حالة الطاولة دائماً إلى reserved
      $table->status = 'reserved';
      $table->save();

      $data = [];
      $data['qr_code_url'] = $qrCodeUrl;
      $data['customer'] = $existingCustomer;
      $data['restaurant'] = $restaurant_id;
      $data['restaurant_name'] = $restaurantName;
      return response()->json(['data' => $data]);
    }

    // إذا ما كان في جلسة سابقة
    $token = bin2hex(random_bytes(16));
    $customer = Customer::create([
      'token' => $token,
      'table_id' => $id,
      'expires_at' => null,
    ]);

    $qrCodeUrl = url('/scan-login?token=' . $token);

    // تحديث حالة الطاولة دائماً إلى reserved
    $table->status = 'reserved';
    $table->save();

    $data = [];
    $data['qr_code_url'] = $qrCodeUrl;
    $data['customer'] = $customer;
    $data['restaurant'] = $restaurant_id;
    $data['restaurant_name'] = $restaurantName;
    return response()->json(['data' => $data]);
  }

  public function releaseTable($id)
  {
    $table = Tables::where('id', $id);
    // اجعل الطاولة متاحة واحذف التوكن 
    Customer::where('table_id', $id)->delete();
    $table->update(['status' => 'vacant']);
    return response()->json(['message' => 'Table released and token removed']);
  }

  // public function Addtolist(Request $request)
  // {
  //   $request->validate([
  //     'customer_id' => ['required'],
  //     'food_id'     => 'required|exists:food,id',
  //     'quantity'    => ['required'],
  //     'description' => ['nullable'],
  //   ], [
  //     'customer_id.required' => 'customer_id is required',
  //     'food_id.required'     => 'food_id is required',
  //     'food_id.exists'       => 'food_id is not exist',
  //     'quantity.required'    => 'quantity is required',
  //   ]);

  //   $food     = Food::find($request->food_id);
  //   $customer = Customer::find($request->customer_id);

  //   if (!$food) {
  //     return response()->json(['message' => 'food not found'], 404);
  //   }

  //   if (!$customer) {
  //     return response()->json(['message' => 'customer not found'], 404);
  //   }

  //   // التحقق إذا فيه قائمة موجودة لهذا العميل
  //   $list = listorder::where('customer_id', $request->customer_id)->first();

  //   if (!$list) {
  //     // إذا ما فيه قائمة، ننشئ واحدة جديدة
  //     $list = listorder::create([
  //       'customer_id' => $request->customer_id,
  //     ]);
  //   }

  //   // إضافة العنصر الجديد إلى القائمة (سواء كانت جديدة أو موجودة)
  //   listorderItem::create([
  //     'listorders_id' => $list->id,
  //     'food_id'       => $request->food_id,
  //     'quantity'      => $request->quantity,
  //     'description'   => $request->description ?? 'no edit',
  //   ]);

  //   return response()->json([
  //     'message' => 'Added successfully',
  //     'list_id' => $list->id
  //   ], 201);
  // }


  // public function Addtolist(Request $request)
  // {
  //   $request->validate([
  //     'customer_id' => ['required'],
  //     'food_id'     => 'required|exists:food,id',
  //     'quantity'    => ['required'],
  //     'description' => ['nullable'],
  //   ], [
  //     'customer_id.required' => 'customer_id is required',
  //     'food_id.required'     => 'food_id is required',
  //     'food_id.exists'       => 'food_id is not exist',
  //     'quantity.required'    => 'quantity is required',
  //   ]);

  //   $food     = Food::find($request->food_id);
  //   $customer = Customer::find($request->customer_id);

  //   if (!$food) {
  //     return response()->json(['message' => 'food not found'], 404);
  //   }

  //   if (!$customer) {
  //     return response()->json(['message' => 'customer not found'], 404);
  //   }

  //   // البحث عن قائمة موجودة لهذا العميل
  //   $list = listorder::where('customer_id', $request->customer_id)->first();

  //   if ($list) {
  //     // التحقق إذا فيه طلب مرتبط بهذه القائمة
  //     $orderExists = Order::where('listorders_id', $list->id)->exists();

  //     if ($orderExists) {
  //       // إذا فيه طلب، ننشئ قائمة جديدة
  //       $list = listorder::create([
  //         'customer_id' => $request->customer_id,
  //       ]);
  //     }
  //   } else {
  //     // إذا ما فيه قائمة، ننشئ واحدة جديدة
  //     $list = listorder::create([
  //       'customer_id' => $request->customer_id,
  //     ]);
  //   }

  //   // إضافة العنصر الجديد إلى القائمة (سواء كانت جديدة أو موجودة)
  //   listorderItem::create([
  //     'listorders_id' => $list->id,
  //     'food_id'       => $request->food_id,
  //     'quantity'      => $request->quantity,
  //     'description'   => $request->description ?? 'no edit',
  //   ]);

  //   return response()->json([
  //     'message' => 'Added successfully',
  //     'list_id' => $list->id
  //   ], 201);
  // }


  public function Addtolist(Request $request)
  {
    $request->validate([
      'customer_id' => ['required'],
      'food_id'     => 'required|exists:food,id',
      'quantity'    => ['required'],
      'description' => ['nullable'],
    ], [
      'customer_id.required' => 'customer_id is required',
      'food_id.required'     => 'food_id is required',
      'food_id.exists'       => 'food_id is not exist',
      'quantity.required'    => 'quantity is required',
    ]);

    $food     = Food::find($request->food_id);
    $customer = Customer::find($request->customer_id);

    if (!$food) {
      return response()->json(['message' => 'food not found'], 404);
    }

    if (!$customer) {
      return response()->json(['message' => 'customer not found'], 404);
    }

    // البحث عن أي قائمة مرتبطة بطلب لهذا العميل
    $listIdsForCustomer = ListOrder::where('customer_id', $request->customer_id)->pluck('id');

    $hasOrder = Order::whereIn('listorders_id', $listIdsForCustomer)->exists();

    if ($hasOrder) {
      // إذا فيه طلب، نبحث عن قائمة بدون طلب
      $listWithoutOrder = ListOrder::where('customer_id', $request->customer_id)
        ->whereNotIn('id', Order::pluck('listorders_id'))
        ->first();

      if ($listWithoutOrder) {
        $list = $listWithoutOrder;
      } else {
        // إذا ما فيه قائمة بدون طلب، ننشئ واحدة جديدة
        $list = ListOrder::create([
          'customer_id' => $request->customer_id,
        ]);
      }
    } else {
      // إذا ما فيه أي طلب، نبحث عن قائمة موجودة
      $list = ListOrder::where('customer_id', $request->customer_id)->first();

      if (!$list) {
        $list = ListOrder::create([
          'customer_id' => $request->customer_id,
        ]);
      }
    }

    // إضافة العنصر للقائمة
    ListOrderItem::create([
      'listorders_id' => $list->id,
      'food_id'       => $request->food_id,
      'quantity'      => $request->quantity,
      'description'   => $request->description ?? 'no edit',
    ]);

    return response()->json([
      'message' => 'Added successfully',
      'list_id' => $list->id
    ], 201);
  }

  // public function getlist($id)
  // {
  //   // جلب جميع القوائم الخاصة بالعميل
  //   $lists = ListOrder::where('customer_id', $id)->get();

  //   if ($lists->isEmpty()) {
  //     return response()->json(['message' => 'No lists found for this customer'], 404);
  //   }

  //   // فلترة القوائم بحيث نستبعد أي قائمة لها أوردر موجود
  //   $listsWithoutOrders = $lists->filter(function ($list) {
  //     return !Order::where('listorders_id', $list->id)->exists();
  //   });

  //   if ($listsWithoutOrders->isEmpty()) {
  //     return response()->json(['message' => 'No lists without orders found'], 404);
  //   }

  //   // تجهيز البيانات
  //   $formattedLists = $listsWithoutOrders->map(function ($list) {
  //     $items = ListOrderItem::where('listorders_id', $list->id)->get();

  //     return [
  //       'list_id' => $list->id,
  //       'items' => $items->map(function ($item) {
  //         $food = Food::find($item->food_id);

  //         return [
  //           'food_name'   => $food ? $food->name : 'Unknown',
  //           // هنا نرجع الصورة كرابط كامل
  //           'image'       => $food && $food->image
  //             ? asset('storage/' . $food->image)
  //             : asset('images/default.png'),
  //           'quantity'    => $item->quantity,
  //           'description' => $item->description,
  //         ];
  //       }),
  //     ];
  //   });

  //   return response()->json([
  //     'customer_id' => $id,
  //     'lists'       => $formattedLists,
  //   ], 200);
  // }



  public function getlist($id)
  {
    // جلب جميع القوائم الخاصة بالعميل
    $lists = ListOrder::where('customer_id', $id)->get();

    if ($lists->isEmpty()) {
      return response()->json(['message' => 'No lists found for this customer'], 404);
    }

    // فلترة القوائم بحيث نستبعد أي قائمة لها أوردر موجود
    $listsWithoutOrders = $lists->filter(function ($list) {
      return !Order::where('listorders_id', $list->id)->exists();
    });

    if ($listsWithoutOrders->isEmpty()) {
      return response()->json(['message' => 'No lists without orders found'], 404);
    }

    // تجهيز البيانات
    $formattedLists = $listsWithoutOrders->map(function ($list) {
      $items = ListOrderItem::where('listorders_id', $list->id)->get();

      return [
        'list_id' => $list->id,
        'items' => $items->map(function ($item) {
          $food = Food::find($item->food_id);

          return [
            'food_id'    => $food ? $food->id : null,   // ← إضافة الـ id
            'food_name'  => $food ? $food->name : 'Unknown',
            'image'      => $food && $food->image
              ? asset('storage/' . $food->image)
              : asset('images/default.png'),
            'quantity'   => $item->quantity,
            'description' => $item->description,
          ];
        }),
      ];
    });

    return response()->json([
      'customer_id' => $id,
      'lists'       => $formattedLists,
    ], 200);
  }


  public function deletefoodfromlist($id)
  {
    $listorder_item = listorderItem::where('food_id', $id)->first();
    if ($listorder_item) {
      $listorder_item->delete();
      return response()->json([
        'message' => 'Deleted successfully',
      ]);
    } else {
      return response()->json(['message' => 'food not found'], 404);
    }
  }

  public function CreateOrder($id)
  {
    // جلب جميع القوائم الخاصة بالعميل
    $lists = ListOrder::where('customer_id', $id)->get();

    if ($lists->isEmpty()) {
      return response()->json(['message' => 'No lists found for this customer'], 404);
    }

    $createdOrders = [];

    foreach ($lists as $list) {
      // التحقق إذا في أوردر موجود مسبقًا لنفس الـ listorders_id
      $existingOrder = Order::where('listorders_id', $list->id)->first();
      if ($existingOrder) {
        // إذا موجود، نتخطى هذه القائمة
        continue;
      }

      // جلب جميع العناصر المرتبطة بالقائمة
      $listItems = ListOrderItem::where('listorders_id', $list->id)->get();

      if ($listItems->isEmpty()) {
        // إذا القائمة فارغة، نتخطاها
        continue;
      }

      // حساب إجمالي الوقت اللازم لتحضير جميع الأطعمة
      $totalTimeInSeconds = 0;

      foreach ($listItems as $item) {
        $food = Food::find($item->food_id);
        if ($food && $food['time-to-make']) {
          $totalTimeInSeconds += strtotime($food['time-to-make']) - strtotime('00:00:00');
        }
      }

      // تحويل إجمالي الوقت إلى صيغة زمنية (ساعات:دقائق:ثواني)
      $totalTimeFormatted = gmdate("H:i:s", $totalTimeInSeconds);

      // إنشاء الطلب الجديد
      $order = Order::create([
        'listorders_id' => $list->id,
        'status'        => 'pending',
        'time-to-make'  => $totalTimeFormatted,
      ]);

      $createdOrders[] = $order;
    }

    if (empty($createdOrders)) {
      return response()->json(['message' => 'No orders created (lists may be empty or already have orders)'], 400);
    }

    return response()->json([
      'message' => 'Orders created successfully',
      'orders'  => $createdOrders,
    ], 201);
  }

  public function getCustomerOrders($id)
  {
    // جلب customer_id من الهيدر
    $customerId = $id;

    if (!$customerId) {
      return response()->json(['message' => 'Customer ID is required'], 400);
    }

    // التحقق من وجود العميل
    $customer = Customer::where('id', $customerId)->first();

    if (!$customer) {
      return response()->json(['message' => 'Customer not found'], 404);
    }

    // جلب جميع الطلبات الخاصة بالعميل عبر ListOrder
    $lists = ListOrder::where('customer_id', $customerId)->get();

    if ($lists->isEmpty()) {
      return response()->json(['message' => 'No orders found for this customer'], 404);
    }

    // ترتيب بيانات الطلبات
    $orders = $lists->map(function ($list) use ($customer) {
      // جلب الطلب المرتبط بالقائمة
      $order = Order::where('listorders_id', $list->id)->first();

      if (!$order) return null;

      // جلب جميع العناصر المرتبطة بالقائمة
      $listItems = ListOrderItem::where('listorders_id', $list->id)->get();

      // تجهيز بيانات الأطعمة لكل طلب
      $items = $listItems->map(function ($item) {
        $food = Food::find($item->food_id);
        return [
          'food_name' => $food ? $food->name : 'Unknown',
          'quantity' => $item->quantity,
          'description' => $item->description,
        ];
      });

      return [
        'order_id' => $order->id,
        'status'=>$order->status,
        'table_id' => $customer->table_id, // رقم الطاولة الخاصة بالعميل
        'items' => $items,
      ];
    })->filter(); // استبعاد الطلبات غير الصالحة (التي لا تحتوي على بيانات)

    return response()->json($orders, 200);
  }

  // public function CreateMusic(Request $request, $id)
  // {
  //   $request->validate([
  //     'name' => ['required']
  //   ], [
  //     'name.required' => 'you shoul enter the name of music',
  //   ]);
  //   $customer = Customer::where('id', $id)->first();
  //   if (!$customer) {
  //     return response()->json(['message' => 'Customer not found'], 404);
  //   }
  //   $tabelid = $customer['table_id'];
  //   $music = Music::create([
  //     'name' => $request['name']
  //   ]);
  //   $tablemusic = Music_Table::create([
  //     'table_id' => $tabelid,
  //     'music_id' => $music['id']
  //   ]);
  //   return response()->json(['message' => 'Music created successfully'], 200);
  // }

  public function createMusicAsEmployee(Request $request)
  {
    $request->validate([
      'name' => ['required']
    ], [
      'name.required' => 'You should enter the name of music',
    ]);

    $user = auth()->user();
    if (!$user || $user->role !== 'Employee') {
      return response()->json(['message' => 'Unauthorized'], 403);
    }

    // نجيب الموظف المرتبط بالمستخدم الحالي
    $employee = Employees::where('user_id', $user->id)->first();

    if (!$employee) {
      return response()->json(['message' => 'Employee record not found'], 404);
    }
    if (!$employee->reastaurant_id) {
      return response()->json(['message' => 'Restaurant not found for employee'], 404);
    }

    $music = Music::create([
      'name'          => $request->name,
      'restaurant_id' => $employee->reastaurant_id,
    ]);

    return response()->json([
      'message' => 'Music created successfully by employee',
      'music'   => $music
    ], 200);
  }


  public function createMusicAsCustomer(Request $request, $customerId)
  {
    $request->validate([
      'name' => ['required']
    ], [
      'name.required' => 'You should enter the name of music',
    ]);

    $customer = Customer::find($customerId);
    if (!$customer) {
      return response()->json(['message' => 'Customer not found'], 404);
    }

    $table = Tables::find($customer->table_id);
    if (!$table) {
      return response()->json(['message' => 'Table not found'], 404);
    }

    $music = Music::create([
      'name'          => $request->name,
      'restaurant_id' => $table->reastaurants_id,
    ]);

    Music_Table::create([
      'table_id' => $table->id,
      'music_id' => $music->id,
    ]);

    return response()->json([
      'message' => 'Music created successfully by customer',
      'music'   => $music
    ], 200);
  }


  // public function GetallMusic()
  // {
  //   $user = Auth::user();

  //   // إذا كان موظف
  //   $employee = Employees::where('user_id', $user->id)->first();

  //   if ($employee) {
  //     $restaurantId = $employee->reastaurant_id;
  //   } else {
  //     // إذا كان صاحب مطعم
  //     $restaurant = Reastaurant::where('user_id', $user->id)->first();
  //     $restaurantId = $restaurant?->id;
  //   }

  //   if (!$restaurantId) {
  //     return response()->json(['message' => 'No restaurant found for this user']);
  //   }

  //   $music = Music::where('restaurant_id', $restaurantId)->get();

  //   if ($music->isNotEmpty()) {
  //     return response()->json([
  //       'musics' => $music
  //     ]);
  //   }

  //   return response()->json(['message' => 'No music found for this restaurant']);
  // }




  public function GetallMusic()
  {
    $user = Auth::user();

    // إذا كان موظف
    $employee = Employees::where('user_id', $user->id)->first();

    if ($employee) {
      $restaurantId = $employee->reastaurant_id;
    } else {
      // إذا كان صاحب مطعم
      $restaurant = Reastaurant::where('user_id', $user->id)->first();
      $restaurantId = $restaurant?->id;
    }

    if (!$restaurantId) {
      return response()->json(['message' => 'No restaurant found for this user']);
    }

    // ترتيب من الأقدم للأحدث
    $music = Music::where('restaurant_id', $restaurantId)
      ->orderBy('created_at', 'asc')
      ->get();

    if ($music->isNotEmpty()) {
      return response()->json([
        'musics' => $music
      ]);
    }

    return response()->json(['message' => 'No music found for this restaurant']);
  }

  public function GetallMusicForCustomer($restaurantId)
  {
    // تحقق إذا المطعم موجود
    $restaurant = Reastaurant::find($restaurantId);

    if (!$restaurant) {
      return response()->json(['message' => 'Restaurant not found'], 404);
    }

    // ترتيب من الأقدم للأحدث
    $music = Music::where('restaurant_id', $restaurantId)
      ->orderBy('created_at', 'asc')
      ->get();

    if ($music->isNotEmpty()) {
      return response()->json([
        'restaurant_id' => $restaurantId,
        'restaurant_name' => $restaurant->name,
        'musics' => $music
      ]);
    }

    return response()->json(['message' => 'No music found for this restaurant']);
  }

  public function deleteMusic($id)
  {
    $music = Music::find($id);
    if ($music) {
      $music->delete();
      return response()->json(['message' => 'Music deleted successfully']);
    }
    return response()->json(['message' => 'Music not found']);
  }

  // public function GetMyCar($qr)
  // {
  //   $car = Parking::where('Qr-CODE', $qr)->first();
  //   if ($car) {
  //     $car['status'] = 'arraived';
  //     $car->save();
  //     return response()->json([
  //       'massage' => 'we will arrived your car',
  //       'car' => $car
  //     ]);
  //   }
  //   return response()->json(['message' => 'Car not found']);
  // }


  public function GetMyCar($nCar)
  {
    // البحث عن السيارة حسب رقمها (n_car)
    $car = Parking::where('n-car', $nCar)->first();

    if ($car) {
      $car->status = 'arraived';
      $car->save();

      return response()->json([
        'message' => 'we will arrive your car',
        'car' => $car
      ]);
    }

    return response()->json(['message' => 'Car not found']);
  }


  public function CreateReview(Request $request)
  {
    $request->validate([
      'restaurant_id' => ['required'],
      'ruting' => ['required', 'between:1,5'],
      'discription' => ['nullable']
    ], [
      'restaurant_id.required' => 'restaurant id is required',
      'ruting.required' => 'ruting is required',
      'ruting.between' => 'ruting must be between 1 and 5',
    ]);
    if ($request->ruting < 1 || $request->ruting > 5) {
      return response()->json(['message' => 'ruting must be between 1 and 5']);
    }

    $review = Review::create([
      'restaurant_id' => $request->restaurant_id,
      'ruting' => $request->ruting,
      'discription' => !empty($request->discription) ? $request->discription : 'no discription',
    ]);

    return response()->json(['massage' => 'review created successfully']);
  }




  public function callwaiter(Request $request, $customerId)
  {
    // تحقق من وجود الرسالة
    $request->validate([
      'message' => 'required|string|max:1000',
    ]);

    // جلب الكوستومر
    $customer = Customer::findOrFail($customerId);

    // تأكد أن الكوستومر عنده table_id
    if (!$customer->table_id) {
      return response()->json(['error' => 'Customer has no table assigned'], 400);
    }

    // جلب الطاولة المرتبطة
    $table = Tables::find($customer->table_id);

    if (!$table) {
      return response()->json(['error' => 'Table not found'], 404);
    }

    // جلب المطعم من الطاولة
    $restaurantId = $table->reastaurants_id;

    // إنشاء سجل جديد
    $record = EmployeeCustomer::create([
      'customer_id'   => $customer->id,
      'restaurant_id' => $restaurantId,
      'message'       => $request->message,
    ]);

    return response()->json([
      'success' => true,
      'data'    => $record
    ], 201);
  }



  // public function getFoodByRestaurantId($restaurant_id)
  // {
  //   // التأكد من وجود المطعم
  //   $restaurant = Reastaurant::find($restaurant_id);

  //   if (!$restaurant) {
  //     return response()->json(['message' => 'No restaurant found with this ID'], 404);
  //   }

  //   // جلب الأكلات الخاصة بالمطعم
  //   $food = Food::where('reastaurants_id', $restaurant->id)->get()
  //     ->map(function ($item) {
  //       $categoryName = Categories::find($item->categories_id)?->name;

  //       return [
  //         'id' => $item->id,
  //         'name' => $item->name,
  //         'price' => $item->price,
  //         'discription' => $item->discription,
  //         'categories_id' => $item->categories_id,
  //         'category_name' => $categoryName,
  //         'reastaurants_id' => $item->reastaurants_id,
  //         'discount' => $item->discount,
  //         'time-to-make' => $item->{'time-to-make'},
  //         'image' => asset('storage/' . $item->image),
  //         'created_at' => $item->created_at,
  //         'updated_at' => $item->updated_at,
  //       ];
  //     });

  //   return response()->json(['food' => $food]);
  // }

  public function getFoodByRestaurantId($table_id)
  {
    // التأكد من وجود الطاولة
    $table = Tables::find($table_id);

    if (!$table) {
      return response()->json(['message' => 'No table found with this ID'], 404);
    }

    // جلب المطعم المرتبط بالطاولة
    $restaurant = Reastaurant::find($table->reastaurants_id);

    if (!$restaurant) {
      return response()->json(['message' => 'No restaurant found for this table'], 404);
    }

    // جلب الأكلات الخاصة بالمطعم
    $food = Food::where('reastaurants_id', $restaurant->id)->get()
      ->map(function ($item) {
        $categoryName = Categories::find($item->categories_id)?->name;

        return [
          'id'             => $item->id,
          'name'           => $item->name,
          'price'          => $item->price,
          'discription'    => $item->discription,
          'categories_id'  => $item->categories_id,
          'category_name'  => $categoryName,
          'discount'       => $item->discount,
          'time-to-make'   => $item->{'time-to-make'},
          'image'          => asset('storage/' . $item->image),
          'created_at'     => $item->created_at,
          'updated_at'     => $item->updated_at,
        ];
      });

    return response()->json([
      'table_id'    => $table_id,
      'restaurant'  => $restaurant->name,
      'food'        => $food
    ]);
  }
}
