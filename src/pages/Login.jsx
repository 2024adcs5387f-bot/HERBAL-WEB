import React from "react";
import LoginForm from "../components/user/forms/LoginForm";

const Login = () => {
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-4 text-center">Login</h1>
              {/* New logic lives inside the form component */}
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
