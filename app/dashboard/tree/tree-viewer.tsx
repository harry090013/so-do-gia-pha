'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LifeStatus, PersonGender } from '@prisma/client';

// SVG Vector Placeholders cho Ảnh đại diện
const MaleAvatar = () => (
  <svg className="w-full h-full bg-blue-50/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#3b82f6" fillOpacity="0.8"/>
    <path d="M12 13C8.68629 13 6 15.6863 6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19C18 15.6863 15.3137 13 12 13Z" fill="#3b82f6" fillOpacity="0.8"/>
  </svg>
);

const FemaleAvatar = () => (
  <svg className="w-full h-full bg-rose-50/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#ec4899" fillOpacity="0.8"/>
    <path d="M12 13C8.68629 13 6 15.6863 6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19C18 15.6863 15.3137 13 12 13Z" fill="#ec4899" fillOpacity="0.8"/>
  </svg>
);

const DeceasedAvatar = () => (
  <svg className="w-full h-full bg-zinc-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="#a1a1aa" fillOpacity="0.8"/>
    <path d="M12 13C8.68629 13 6 15.6863 6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19C18 15.6863 15.3137 13 12 13Z" fill="#a1a1aa" fillOpacity="0.8"/>
  </svg>
);

export default function TreeViewer({
  people,
  relationships,
}: {
  people: any[];
  relationships: any[];
}) {
  // Zoom & Pan states
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 120, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  // Bộ lọc & Tìm kiếm states
  const [maxGeneration, setMaxGeneration] = useState<number>(99); // Mặc định hiển thị tất cả đời
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Layout Parameters (Kích thước thẻ đứng)
  const cardWidth = 130;
  const cardHeight = 160;
  const rowHeight = 250;
  const colWidth = 190;

  // Lọc mọi thành viên thỏa mãn giới hạn đời (Giới hạn cấp)
  const visiblePeople = people.filter((p) => (p.generationDisplay || 1) <= maxGeneration);
  const visiblePeopleIds = new Set(visiblePeople.map((p) => p.id));

  // Lọc quan hệ giữa những người hiển thị
  const visibleRelationships = relationships.filter(
    (r) => visiblePeopleIds.has(r.parentId) && visiblePeopleIds.has(r.childId)
  );

  // 1. Phân nhóm thành viên theo Thế hệ
  const generations: Record<number, any[]> = {};
  visiblePeople.forEach((p) => {
    const gen = p.generationDisplay || 1;
    if (!generations[gen]) generations[gen] = [];
    generations[gen].push(p);
  });

  const genKeys = Object.keys(generations)
    .map(Number)
    .sort((a, b) => a - b);

  // 2. Tính toán tọa độ cho từng người
  const nodePositions: Record<string, { x: number; y: number }> = {};
  genKeys.forEach((gen, rowIndex) => {
    const members = generations[gen];
    const totalRowWidth = members.length * colWidth;
    members.forEach((member, colIndex) => {
      const x = colIndex * colWidth - totalRowWidth / 2 + 400;
      const y = rowIndex * rowHeight + 50;
      nodePositions[member.id] = { x, y };
    });
  });

  // 3. Tìm kiếm và Tự động di chuyển tiêu điểm (Auto-focus Pan)
  const handleSearchSelect = (person: any) => {
    setSelectedPerson(person);
    setSearchQuery('');
    setShowDropdown(false);

    // Tính toán tọa độ trung tâm container để di chuyển phả đồ
    const pos = nodePositions[person.id];
    if (pos && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      // Căn giữa node trên màn hình
      const targetX = containerWidth / 2 - (pos.x + cardWidth / 2) * scale;
      const targetY = containerHeight / 2 - (pos.y + cardHeight / 2) * scale;
      
      setPosition({ x: targetX, y: targetY });
    }
  };

  // Lọc danh sách gợi ý tìm kiếm
  const searchSuggestions = people.filter((p) =>
    p.primaryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 4. Zoom & Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-card') || (e.target as HTMLElement).closest('.search-box')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    let newScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
    newScale = Math.max(0.4, Math.min(2, newScale));
    setScale(newScale);
  };

  return (
    <div className="relative w-full h-[68vh] bg-white border border-zinc-200 rounded-2xl overflow-hidden select-none shadow-sm flex flex-col">
      
      {/* Top Controls: Search and Level Filter */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 z-20">
        
        {/* Level Filter (Giới hạn đời) */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
          <span>Giới hạn cấp:</span>
          <select
            value={maxGeneration}
            onChange={(e) => setMaxGeneration(parseInt(e.target.value))}
            className="bg-white border border-zinc-200 px-2.5 py-1.5 rounded-lg text-zinc-800 focus:outline-none"
          >
            <option value={99}>-- Không giới hạn --</option>
            <option value={1}>1 đời (Chỉ Tổ tiên)</option>
            <option value={2}>2 đời</option>
            <option value={3}>3 đời</option>
            <option value={4}>4 đời</option>
          </select>
        </div>

        {/* Smart Search Box */}
        <div className="relative w-full sm:w-64 search-box">
          <input
            type="text"
            placeholder="🔍 Tìm nhanh thành viên..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          {showDropdown && searchQuery && (
            <div className="absolute right-0 left-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-30 divide-y divide-zinc-100">
              {searchSuggestions.length === 0 ? (
                <div className="p-3 text-center text-xs text-zinc-400 italic">Không thấy thành viên...</div>
              ) : (
                searchSuggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSearchSelect(p)}
                    className="p-2.5 hover:bg-zinc-50 cursor-pointer text-xs text-zinc-800 flex justify-between items-center"
                  >
                    <span className="font-semibold">{p.primaryName}</span>
                    <span className="text-[10px] text-zinc-400">Đời {p.generationDisplay}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* Graphical Workspace */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full flex-grow cursor-grab active:cursor-grabbing relative overflow-hidden bg-white"
      >
        
        {/* Căn giữa nhanh & Reset zoom */}
        <div className="absolute top-4 left-4 bg-white/95 border border-zinc-200 p-1.5 rounded-xl flex gap-1 z-10 shadow-sm text-xs font-semibold">
          <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-700 border border-zinc-200 bg-white">＋</button>
          <button onClick={() => setScale(Math.max(0.4, scale - 0.1))} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-700 border border-zinc-200 bg-white">－</button>
          <button onClick={() => { setScale(0.85); setPosition({ x: 120, y: 30 }); }} className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 border border-zinc-200 bg-white text-[10px]">Mặc định</button>
        </div>

        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="absolute inset-0 w-[2000px] h-[2000px]"
        >
          
          {/* SVG Connection Lines - Orthogonal Layout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {visibleRelationships.map((rel) => {
              const from = nodePositions[rel.parentId];
              const to = nodePositions[rel.childId];
              if (!from || !to) return null;

              const startX = from.x + cardWidth / 2;
              const startY = from.y + cardHeight;
              const endX = to.x + cardWidth / 2;
              const endY = to.y;
              
              // Điểm gãy vuông góc
              const midY = startY + (endY - startY) * 0.45;

              return (
                <path
                  key={rel.id}
                  // Vẽ đường nối vuông góc (Orthogonal)
                  d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
                  fill="none"
                  stroke="#a1a1aa" // zinc-400 nét xám rõ ràng hơn
                  strokeWidth="2"
                  strokeOpacity="0.9"
                />
              );
            })}
          </svg>

          {/* Render People Cards */}
          {visiblePeople.map((person) => {
            const pos = nodePositions[person.id];
            if (!pos) return null;

            const isDeceased = person.lifeStatus === LifeStatus.deceased;
            const isMale = person.gender === PersonGender.male;
            const isFemale = person.gender === PersonGender.female;

            let cardStyles = 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-800';
            if (selectedPerson?.id === person.id) {
              cardStyles = 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-zinc-950';
            } else if (isDeceased) {
              cardStyles = 'bg-zinc-50 border-zinc-200 text-zinc-500';
            } else if (isMale) {
              cardStyles = 'bg-white border-blue-200 hover:border-blue-300 text-zinc-800';
            } else if (isFemale) {
              cardStyles = 'bg-white border-rose-200 hover:border-rose-300 text-zinc-800';
            }

            return (
              <div
                key={person.id}
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: cardWidth,
                  height: cardHeight,
                }}
                onClick={() => setSelectedPerson(person)}
                className={`node-card absolute rounded-xl flex flex-col overflow-hidden cursor-pointer border transition-all duration-150 select-none shadow-sm hover:shadow ${cardStyles}`}
              >
                
                {/* Avatar */}
                <div className="w-full h-[95px] relative border-b border-zinc-100 overflow-hidden flex items-center justify-center bg-zinc-50">
                  {isDeceased ? (
                    <DeceasedAvatar />
                  ) : isFemale ? (
                    <FemaleAvatar />
                  ) : (
                    <MaleAvatar />
                  )}
                </div>

                {/* Text Info */}
                <div className="p-2 flex flex-col justify-between flex-grow text-center">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold block">
                    {person.birthYear || '?'}{' - '}{isDeceased ? (person.deathYear || '?') : 'Sống'}
                  </span>
                  
                  <h5 className="font-bold text-[11px] text-zinc-800 truncate px-0.5 leading-tight my-0.5">
                    {person.primaryName}
                  </h5>

                  <div className="flex justify-between items-center text-[8px] opacity-75 pt-1 border-t border-zinc-100">
                    <span>Đời {person.generationDisplay}</span>
                    {person.privacyMasked ? <span>🔒</span> : <span>🔓</span>}
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* Drawer Panel bên phải */}
      {selectedPerson && (
        <div className="absolute top-16 right-4 bottom-4 w-72 bg-white border border-zinc-200 rounded-xl p-5 z-20 shadow-lg flex flex-col justify-between text-xs space-y-4">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h4 className="font-bold text-zinc-900 text-sm">Hồ sơ Chi tiết</h4>
              <button onClick={() => setSelectedPerson(null)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-bold text-zinc-950">{selectedPerson.primaryName}</h5>
                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-bold rounded uppercase mt-1">
                  Đời {selectedPerson.generationDisplay}
                </span>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3 text-zinc-600 font-sans">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Giới tính:</span>
                  <span>{selectedPerson.gender === 'male' ? 'Nam' : selectedPerson.gender === 'female' ? 'Nữ' : 'Chưa rõ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Trạng thái:</span>
                  <span>{selectedPerson.isLiving ? '🟢 Còn sống' : '⚪ Đã mất'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Năm sinh:</span>
                  <span>{selectedPerson.birthYear || 'Không rõ'}</span>
                </div>
                {!selectedPerson.isLiving && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Năm mất:</span>
                    <span>{selectedPerson.deathYear || 'Không rõ'}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-zinc-400">SĐT:</span>
                  <span>{selectedPerson.phone || (selectedPerson.privacyMasked ? '🔒 Ẩn bảo mật' : 'Không có')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Email:</span>
                  <span className="truncate max-w-[140px]">{selectedPerson.email || (selectedPerson.privacyMasked ? '🔒 Ẩn bảo mật' : 'Không có')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Địa chỉ:</span>
                  <span>{selectedPerson.currentAddress || (selectedPerson.privacyMasked ? '🔒 Ẩn bảo mật' : 'Không có')}</span>
                </div>
              </div>

              {selectedPerson.biographyPublic && (
                <div className="border-t border-zinc-100 pt-3">
                  <span className="text-zinc-500 font-semibold block mb-1">Tiểu sử:</span>
                  <p className="text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                    {selectedPerson.biographyPublic}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 italic border-t border-zinc-100 pt-2 text-center">
            {selectedPerson.privacyMasked ? '🔒 Đã che bảo mật người còn sống' : '🔓 Hiển thị công khai'}
          </div>
        </div>
      )}

    </div>
  );
}
