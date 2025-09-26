import React from "react";
import RegisterForm from "../components/user/forms/RegisterForm";

const Register = () => {
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-4 text-center">Create Account</h1>
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
