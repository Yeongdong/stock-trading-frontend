"use client";

import { useEffect, useState } from "react";
import { API, STORAGE_KEYS } from "@/constants";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  accountNumber: string;
}

interface KisToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export default function KisToken() {
  const [user, setUser] = useState<User | null>(null);
  const [kisToken, setKisToken] = useState<KisToken | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (!accessToken) {
          console.log("No token found, redirecting to login");
          window.location.href = "/login";
          return;
        }

        const response = await fetch(API.USER.GET_CURRENT, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          window.location.href = "/login";
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  const handleGetKisToken = async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!accessToken) {
        console.log("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const appKeyInput = document.getElementById("appKey") as HTMLInputElement;
      const appSecretInput = document.getElementById(
        "appSecret"
      ) as HTMLInputElement;
      const accountNumberInput = document.getElementById(
        "accountNumber"
      ) as HTMLInputElement;

      const response = await fetch(API.USER.USER_INFO, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appKey: appKeyInput.value,
          appSecret: appSecretInput.value,
          accountNumber: accountNumberInput.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get KIS token");
      }
      const data = await response.json();
      setKisToken(data);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error getting KIS token:", error);
      setError("Failed to get KIS token");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div>
        <label>AppKey:</label>
        <input type="text" id="appKey" />
      </div>
      <div>
        <label>AppSecret:</label>
        <input type="text" id="appSecret" />
      </div>
      <div>
        <label>Account Number:</label>
        <input type="text" id="accountNumber" />
      </div>
      <button onClick={handleGetKisToken}>Get KIS Token</button>
    </div>
  );
}
