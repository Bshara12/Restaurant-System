<?php

namespace App\Http\Controllers;

use App\Models\Categories;
use App\Models\Reastaurant;
use App\Models\User;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{

  public function CreateRestaurent(Request $request)
  {
    $request->validate([
      'name' => ['required'],
      'n-chess' => ['required'],
      'location' => ['required'],
      'user_id' => ['required']
    ], [
      'name.required' => 'Name of restaurant is required',
      'n-chess.required' => 'Number of chess is required',
      'location.required' => 'Location of restaurant is required',
      'user_id.required' => 'User id is required',
    ]);

    $existingRestaurant = Reastaurant::where('name', $request['name'])
      ->where('location', $request['location'])
      ->first();

    if ($existingRestaurant) {
      return response()->json([
        'message' => 'A restaurant with the same name and location already exists.',
      ], 400);
    }

    $restaurant = Reastaurant::query()->create([
      'name' => $request['name'],
      'n-chess' => $request['n-chess'],
      'location' => $request['location'],
      'user_id' => $request['user_id']
    ]);

    return response()->json([
      'message' => 'Restaurant created successfully',
      'data' => $restaurant
    ], 201);
  }

  public function updateRestaurant(Request $request, $id)
  {
    $request->validate([
      'name' => ['sometimes', 'string'],
      'location' => ['sometimes', 'string'],
      'n-chess' => ['sometimes', 'integer'],
    ]);

    $restaurant = Reastaurant::find($id);

    if (!$restaurant) {
      return response()->json([
        'message' => 'Restaurant not found',
        'status' => 404
      ]);
    }

    if ($request->has('name')) {
      $restaurant->name = $request['name'];
    }
    if ($request->has('location')) {
      $restaurant->location = $request['location'];
    }
    if ($request->has('n-chess')) {
      $restaurant['n-chess'] = $request['n-chess'];
    }

    $restaurant->save();

    return response()->json([
      'message' => 'Restaurant updated successfully',
      'status' => 200,
      'data' => $restaurant
    ]);
  }

  public function deleteRestaurant($id)
  {
    $restaurant = Reastaurant::find($id);

    if ($restaurant) {
      $restaurant->delete();
      return response()->json([
        'message' => 'Restaurant deleted successfully',
        'status' => 200
      ]);
    }

    return response()->json([
      'message' => 'Restaurant not found',
      'status' => 404
    ]);
  }

  public function getManagersWithRestaurants()
  {
    $managers = User::where('role', 'Manager')
      ->with('restaurants')
      ->get();

    $formattedManagers = $managers->map(function ($manager) {
      return [
        'id' => $manager->id,
        'username' => $manager->username,
        'email' => $manager->email,
        'restaurants' => $manager->restaurants ? $manager->restaurants->isNotEmpty() ? $manager->restaurants : [] : [],
      ];
    });

    return response()->json($formattedManagers);
  }

  public function CreateCatigory(Request $request)
  {
    $request->validate([
      'name' => ['required', 'unique:categories,name']
    ], [
      'name.required' => 'Please enter the name',
      'name.unique' => 'Category name already exist',
    ]);
    $category = Categories::create([
      'name' => $request['name'],
    ]);
    return response()->json(['message' => 'Category created successfully', 'data' => $category]);
  }

  public function GetAllCategory()
  {
    $categories = Categories::all();
    return response()->json([
      'message' => 'Categories fetched successfully',
      'data' => $categories
    ]);
  }

  public function GetAllRest()
  {
    $rest = Reastaurant::with('user:id,username')->get();

    $rest = $rest->map(function ($restaurant) {
      return [
        'id' => $restaurant->id,
        'name' => $restaurant->name,
        'n_chase' => $restaurant['n-chess'],
        'location' => $restaurant->location,
        'user_name' => $restaurant->user->username ?? 'Unknown'
      ];
    });

    return response()->json([
      'message' => 'Restaurants fetched successfully',
      'data' => $rest
    ]);
  }

  public function GetResDetails($id)
  {
    $rest = Reastaurant::with('user:id,username')->find($id);
    return response()->json([
      'message' => 'Restaurant details fetched successfully',
      'data' => $rest
    ]);
  }

  public function GetAllManager()
  {
    $managers = User::where('role', 'Manager')->get();
    return response()->json([
      'message' => 'Managers fetched successfully',
      'data' => $managers
    ]);
  }


  public function GetManagerDetails($id)
  {
    $manager = User::find($id);
    $rest = Reastaurant::with('user:id,username')->where('user_id', $manager->id)->get();
    $data = [];
    $data['Manager'] = $manager;
    $data['Restaurants'] = $rest;
    return response()->json([
      'message' => 'Manager details fetched successfully',
      'data' => $data
    ]);
  }


  public function DeleteUser($id)
  {
    $user = User::find($id);
    if ($user) {
      $user->delete();
      return response()->json([
        'message' => 'User deleted successfully',
      ]);
    } else {
      return response()->json([
        'message' => 'User not found',
      ]);
    }
  }

  public function DeleteCategory($id)
  {
    $category = Categories::find($id);
    if ($category) {
      $category->delete();
      return response()->json([
        'message' => 'Category deleted successfully',
      ]);
    } else {
      return response()->json([
        'message' => 'Category not found',
      ]);
    }
  }
}
