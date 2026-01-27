import React from "react";

export const FooterA = () => {
    return (
        <footer
            className="card h-100 mx-auto text-white"
            style={{
                maxWidth: "70%",
                backgroundColor: "#3a3a4dff",
                borderRadius: "0",
                position: "fixed",   // keeps it in place
                bottom: 0,           // anchors to bottom
                left: 0,
                right: 0,
                margin: "0 auto",    // centers horizontally
            }}
        >
            <div className="card-body d-flex justify-content-between align-items-center">
                <h6 className="card-title">
                    © Effractarius {new Date().getFullYear()}
                </h6>
                <div className="d-flex">
                    <img
                        src="/4geeks.ico"
                        alt="4Geeks Academy Logo"
                        style={{ height: "30px" }}
                    />
                </div>
            </div>
        </footer >
    );
};