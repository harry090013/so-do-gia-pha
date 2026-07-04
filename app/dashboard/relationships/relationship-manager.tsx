'use client';

import React, { useState, useTransition } from 'react';
import { saveRelationshipAction, savePartnershipAction } from '../../actions';
import { Person, ParentRole, ParentChildType, PartnershipType, PartnershipStatus } from '@prisma/client';

export default function RelationshipManager({
  people,
  familyId,
}: {
  people: Person[];
  familyId: string;
}) {
  const [activeTab, setActiveTab] = useState<'parent-child' | 'marriage'>('parent-child');

  // Parent-Child states
  const [childId, setChildId] = useState('');
  const [parentId, setParentId] = useState('');
  const [parentRole, setParentRole] = useState<ParentRole>('unknown');
  const [relType, setRelType] = useState<ParentChildType>('biological');
  const [childOrder, setChildOrder] = useState('');
  const [childOrderLabel, setChildOrderLabel] = useState('');

  // Partnership states
  const [person1Id, setPerson1Id] = useState('');
  const [person2Id, setPerson2Id] = useState('');
  const [partnershipType, setPartnershipType] = useState<PartnershipType>('marriage');
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus>('active');
  const [startYear, setStartYear] = useState('');

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const resetForm = () => {
    setChildId('');
    setParentId('');
    setParentRole('unknown');
    setRelType('biological');
    setChildOrder('');
    setChildOrderLabel('');
    setPerson1Id('');
    setPerson2Id('');
    setPartnershipType('marriage');
    setPartnershipStatus('active');
    setStartYear('');
    setMessage(null);
  };

  const handleParentChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !parentId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn đầy đủ Cha/Mẹ và Con.' });
      return;
    }
    if (parentId === childId) {
      setMessage({ type: 'error', text: 'Không thể liên kết một người làm cha/mẹ của chính mình.' });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        await saveRelationshipAction(
          familyId,
          parentId,
          childId,
          parentRole,
          relType,
          childOrder ? parseInt(childOrder) : undefined,
          childOrderLabel || undefined
        );
        setMessage({ type: 'success', text: 'Đã liên kết quan hệ Cha/Mẹ - Con thành công!' });
        resetForm();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Lỗi khi liên kết.' });
      }
    });
  };

  const handlePartnershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person1Id || !person2Id) {
      setMessage({ type: 'error', text: 'Vui lòng chọn đầy đủ 2 đối tác kết hôn.' });
      return;
    }
    if (person1Id === person2Id) {
      setMessage({ type: 'error', text: 'Một người không thể kết hôn với chính mình.' });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        await savePartnershipAction(
          familyId,
          person1Id,
          person2Id,
          partnershipType,
          partnershipStatus,
          startYear ? parseInt(startYear) : undefined
        );
        setMessage({ type: 'success', text: 'Đã thiết lập quan hệ kết hôn thành công!' });
        resetForm();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Lỗi khi liên kết.' });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Forms column */}
      <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 pb-3 gap-4">
          <button
            onClick={() => { resetForm(); setActiveTab('parent-child'); }}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'parent-child' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            👨‍👦 Liên kết Cha Mẹ - Con
            {activeTab === 'parent-child' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded"></span>}
          </button>
          
          <button
            onClick={() => { resetForm(); setActiveTab('marriage'); }}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'marriage' ? 'text-indigo-600 font-extrabold' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            💍 Liên kết Kết hôn (Vợ/Chồng)
            {activeTab === 'marriage' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded"></span>}
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? '✓ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        {/* Form 1: Parent-Child */}
        {activeTab === 'parent-child' && (
          <form onSubmit={handleParentChildSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Chọn Cha / Mẹ</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.primaryName} ({p.birthYear || 'Không rõ'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Chọn Con</label>
                <select
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.primaryName} ({p.birthYear || 'Không rõ'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Vai trò phụ huynh</label>
                <select
                  value={parentRole}
                  onChange={(e) => setParentRole(e.target.value as ParentRole)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="father">Cha (Father)</option>
                  <option value="mother">Mẹ (Mother)</option>
                  <option value="parent">Phụ huynh (Parent)</option>
                  <option value="unknown">Chưa rõ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Loại quan hệ</label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as ParentChildType)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="biological">Con ruột (Biological)</option>
                  <option value="adoptive">Con nuôi (Adoptive)</option>
                  <option value="step">Con riêng (Step-child)</option>
                  <option value="foster">Con đỡ đầu (Foster)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Thứ tự con</label>
                <input
                  type="number"
                  placeholder="VD: 1, 2"
                  value={childOrder}
                  onChange={(e) => setChildOrder(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Danh xưng hiển thị</label>
                <input
                  type="text"
                  placeholder="VD: Con trưởng, Con thứ"
                  value={childOrderLabel}
                  onChange={(e) => setChildOrderLabel(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-md disabled:opacity-50"
            >
              {isPending ? 'Đang liên kết...' : 'Thiết lập liên kết Cha/Con'}
            </button>
          </form>
        )}

        {/* Form 2: Marriage */}
        {activeTab === 'marriage' && (
          <form onSubmit={handlePartnershipSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Thành viên thứ nhất</label>
                <select
                  value={person1Id}
                  onChange={(e) => setPerson1Id(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.primaryName} ({p.birthYear || 'Không rõ'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Thành viên thứ hai</label>
                <select
                  value={person2Id}
                  onChange={(e) => setPerson2Id(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="">-- Chọn thành viên --</option>
                  {people.map(p => (
                    <option key={p.id} value={p.id}>{p.primaryName} ({p.birthYear || 'Không rõ'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Kiểu hôn nhân</label>
                <select
                  value={partnershipType}
                  onChange={(e) => setPartnershipType(e.target.value as PartnershipType)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="marriage">Hôn nhân chính thức</option>
                  <option value="remarriage">Tái hôn</option>
                  <option value="concubine">Vợ thứ / Thê thiếp</option>
                  <option value="partner">Bạn đời / Không đăng ký</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</label>
                <select
                  value={partnershipStatus}
                  onChange={(e) => setPartnershipStatus(e.target.value as PartnershipStatus)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                >
                  <option value="active">Đang chung sống</option>
                  <option value="divorced">Ly hôn</option>
                  <option value="widowed">Góa phụ</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-zinc-500 uppercase tracking-wider">Năm kết hôn</label>
                <input
                  type="number"
                  placeholder="VD: 1985"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-md disabled:opacity-50"
            >
              {isPending ? 'Đang liên kết...' : 'Thiết lập hôn phối'}
            </button>
          </form>
        )}

      </div>

      {/* Constraints panel */}
      <div className="bg-white border border-zinc-200 p-6 rounded-2xl space-y-6 text-xs text-zinc-500 shadow-sm">
        <h3 className="font-bold text-zinc-800 text-sm">⚠️ Quy tắc & Ràng buộc</h3>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-700">1. Phát hiện vòng lặp:</h4>
            <p className="leading-relaxed">
              Hệ thống tự động phát hiện đệ quy nếu người con được chỉ định đã là cha/mẹ hoặc tổ tiên của người cha/mẹ, ngăn chặn tạo vòng lặp phả hệ vô lý.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-700">2. Ràng buộc cha/mẹ sinh học:</h4>
            <p className="leading-relaxed">
              Ngăn chặn đăng ký cha hoặc mẹ sinh học thứ 2 đã được xác nhận hoạt động cho cùng một con.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
