import React from "react";


import { useState } from "react";

import { Link } from "react-router";
import { Header } from "../../Components/Header";

export const LogPage = () => {





    return (  
        <div className="min-h-screen flex flex-col box-border gap-5">
            <Header/>
            <Link to='/admin/dashboard'><button>Go To dashboard</button></Link>
        </div>
    )
}
 