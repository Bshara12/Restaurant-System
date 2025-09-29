import { Route, Routes } from "react-router-dom";
import DashBourd from "./Admin/DashBourd";
import "./App.css";
import Restaurants from "./Pages/Restaurants";
import Manager from "./Pages/Manager";
import Addrestaurant from "./Admin/Addrestaurant";
import Addmanager from "./Admin/Addmanager";
import Login from "./Auth/Login";
import ManagerDetails from "./Admin/ManagerDetails";
import RestaurantDetails from "./Admin/RestaurantDetails";
import UserSelection from "./Admin/UserSelection";
import EditRestaurant from "./Admin/EditRestaurant";
import Categories from "./Pages/Categories";
import AddCatigory from "./Admin/AddCatigory";
import ManagerDashbord from "./Managem/ManagerDashbord";
import SelectRestaurant from "./Managem/SelectRestaurant";
import Employee from "./Pages/Manager/Employee";
import Food from "./Pages/Manager/Food";
import Discount from "./Pages/Manager/Discount";
import Table from "./Pages/Manager/Table";
import Catigory from "./Pages/Manager/Catigory";
import Complaints from "./Pages/Manager/Complaints";
import AddEmployee from "./Managem/AddEmployee";
import JobSelector from "./Managem/JobSelector";
import EmployeeDetails from "./Pages/Manager/EmployeeDetails";
import AddTabel from "./Pages/Manager/AddTabel";
import SelecteCatigory from "./Managem/SelecteCatigory";
import AddFood from "./Pages/Manager/AddFood";
import ChifDashboard from "./Employee/chifDashboard";
import ChefOrders from "./Pages/Chef/Orders";
import OrderDetails from "./Pages/Chef/OrderDetails";
import MackComplaint from "./Component/MackComplaint";
import DJDaschBoard from "./Employee/DJDaschBoard";
import Music from "./Pages/DJ/Music";
import WaitersDashboard from "./Employee/WaitersDashboard";
import InvoiceCustomer from "./Pages/Waiters/InvoiceInvoiceCustomer";
import ParkingDashbard from "./Employee/ParkingDashbard";
import Cars from "./Pages/Parking/Cars";
import AddCar from "./Pages/Parking/AddCar";
import CarQR from "./Pages/Parking/CarQR";
import WaiterMessages from "./Pages/waiter/page/Messages";
import Customer from "./Customer/Customer";
import Cart from "./Customer/Cart";
import CustomerOrders from "./Customer/Orders";
import CustomerMusic from "./Customer/Music";
import CustomerParking from "./Customer/Parking";

function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/Admin/dashbord" element={<DashBourd />}>
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="Manager" element={<Manager />} />
        <Route path="Catigories" element={<Categories />} />
      </Route>
      <Route
        path="/Admin/dashbord/addrestaurant/:id"
        element={<Addrestaurant />}
      />
      <Route path="/Admin/dashbord/addmanager" element={<Addmanager />} />
      <Route path="/manager-details/:name" element={<ManagerDetails />} />
      <Route path="/restaurant-details/:name" element={<RestaurantDetails />} />
      <Route path="/Admin/dashbord/UserSelection" element={<UserSelection />} />
      <Route
        path="/Admin/dashbord/restaurant/edit/:id"
        element={<EditRestaurant />}
      />
      <Route path="/Admin/dashboard/add-category" element={<AddCatigory />} />
      {/* *** */}

      {/* Manager */}

      <Route path="/Manager/SelectRestaurant" element={<SelectRestaurant />} />

      <Route path="/Manager/dashborad" element={<ManagerDashbord />}>
        <Route path="employee" element={<Employee />} />
        <Route path="food" element={<Food />} />
        <Route path="Discount" element={<Discount />} />
        <Route path="Table" element={<Table />} />
        <Route path="Catigory" element={<Catigory />} />
        <Route path="Complaints" element={<Complaints />} />
      </Route>
      <Route
        path="/Manager/dashborad/addemployee/:id"
        element={<AddEmployee />}
      />
      <Route path="/Manager/dashborad/selectjob" element={<JobSelector />} />
      <Route path="/Employee-details/:id" element={<EmployeeDetails />} />
      <Route path="/Manager/dashborad/table/addtabel" element={<AddTabel />} />
      <Route
        path="/Manager/dashborad/Catigory/selectcatigory"
        element={<SelecteCatigory />}
      />
      <Route path="/add-food" element={<AddFood />} />

      {/* ** */}

      {/* Chef */}

      <Route path="/Chef/dashboard" element={<ChifDashboard />}>
        <Route path="orders" element={<ChefOrders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="food" element={<Food />} />
        <Route path="Discount" element={<Discount />} />
        <Route path="Catigory" element={<Catigory />} />
        <Route path="Complaints" element={<MackComplaint />} />
      </Route>
      {/*  */}

      {/* DJ */}
      <Route path="/DJ/dashboard" element={<DJDaschBoard />}>
        <Route path="music" element={<Music />} />
        <Route path="Complaints" element={<MackComplaint />} />
      </Route>
      {/*  */}
      {/*Waiters*/}
      <Route path="/Waiters/dashboard" element={<WaitersDashboard />}>
        <Route path="Complaints" element={<MackComplaint />} />
        <Route path="Table" element={<Table />} />
        <Route path="orders" element={<ChefOrders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="invoice" element={<InvoiceCustomer />} />
        <Route path="messages" element={<WaiterMessages />} />
      </Route>
      {/*  */}
      {/* Parking */}
      <Route path="/Parking/dashboard" element={<ParkingDashbard />}>
        <Route path="car" element={<Cars />} />
        <Route path="car/add" element={<AddCar />} />
        <Route path="car/qr/:carNumber" element={<CarQR />} />
        <Route path="Complaints" element={<MackComplaint />} />
      </Route>
      {/*  */}

      {/* Customer */}
      <Route path="/:id" element={<Customer />} />
      <Route path="/" element={<Customer />} />
      <Route path="/:customerId/cart" element={<Cart />} />
      <Route path="/:customerId/orders" element={<CustomerOrders />} />
      <Route path="/:customerId/music" element={<CustomerMusic />} />
      <Route path="/:customerId/parking" element={<CustomerParking />} />
      {/*  */}
    </Routes>
  );
}

export default App;
