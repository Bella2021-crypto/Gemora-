"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CloudSign = { timestamp: number; signature: string; apiKey: string; cloudName: string; };

export default function SellForm() {
  const [title,setTitle]=useState("");
  const [price,setPrice]=useState<number | "">("");
  const [desc,setDesc]=useState("");
  const [images,setImages]=useState<string[]>([]);
  const [size,setSize]=useState("");
  const [brand,setBrand]=useState("");
  const [category,setCategory]=useState("");
  const [condition,setCondition]=useState("");
  const [uploading,setUploading]=useState(false);
  const router = useRouter();

  async function sign(): Promise<CloudSign> {
    const res = await fetch("/api/cloudinary/sign");
    if (!res.ok) throw new Error("Cannot sign");
    return res.json();
    }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const s = await sign();
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", s.apiKey);
        fd.append("timestamp", String(s.timestamp));
        fd.append("signature", s.signature);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/auto/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (data.secure_url) setImages(prev => [...prev, data.secure_url]);
      }
    } catch (e) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(Number(price) * 100);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, priceCents, images, size, brand, category, condition })
    });
    if (res.ok) router.push("/");
    else alert("Failed to create listing");
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <div>
        <label className="label">Title</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Price (NGN)</label><input className="input" type="number" min="0" value={price} onChange={e=>setPrice(e.target.value === "" ? "" : Number(e.target.value))} required /></div>
        <div><label className="label">Condition</label><input className="input" value={condition} onChange={e=>setCondition(e.target.value)} placeholder="New / Like New / Good / Fair" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="label">Size</label><input className="input" value={size} onChange={e=>setSize(e.target.value)} /></div>
        <div><label className="label">Brand</label><input className="input" value={brand} onChange={e=>setBrand(e.target.value)} /></div>
        <div><label className="label">Category</label><input className="input" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Women / Men / Kids / etc." /></div>
      </div>
      <div className="space-y-2">
        <label className="label">Photos</label>
        <input type="file" accept="image/*" multiple onChange={e=>handleFiles(e.target.files)} />
        {uploading && <div className="text-sm">Uploading...</div>}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((src,i)=>(<img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded border" />))}
          </div>
        )}
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[120px]" value={desc} onChange={e=>setDesc(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={uploading}>Publish</button>
    </form>
  );
}
