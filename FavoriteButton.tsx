"use client";
import { useState, useEffect } from "react";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const [faved, setFaved] = useState(false);
  useEffect(() => {
    fetch(`/api/favorites/${listingId}`, { method: "GET" })
      .then(r => r.json()).then(d => setFaved(!!d.favorited)).catch(()=>{});
  }, [listingId]);

  async function toggle() {
    const res = await fetch(`/api/favorites/${listingId}`, { method: faved ? "DELETE" : "POST" });
    if (res.ok) setFaved(!faved);
    else alert("Please login to favorite items.");
  }
  return <button className="btn" onClick={toggle}>{faved ? "★ Favorited" : "☆ Favorite"}</button>;
}
