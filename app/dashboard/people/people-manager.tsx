'use client';

import React, { useState, useTransition } from 'react';
import { createPersonAction, updatePersonAction, archivePersonAction } from '../../actions';
import { Person, Branch, MembershipRole, PrivacyLevel } from '@prisma/client';

export default function PeopleManager({
  initialPeople,
  branches,
  viewerRole,
}: {
  initialPeople: any[];
  branches: Branch[];
  viewerRole: MembershipRole;
}) {
  const [people, setPeople] = useState(initialPeople);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Form states
  const [primaryName, setPrimaryName] = useState('');
  const [gender, setGender] = useState('unknown');
  const [lifeStatus, setLifeStatus] = useState('living');
  const [birthYear, setBirthYear] = useState('');
  const [birthDateValue, setBirthDateValue] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [deathDateValue, setDeathDateValue] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [biographyPublic, setBiographyPublic] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('normal');
  const [branchId, setBranchId] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditor = viewerRole !== MembershipRole.viewer && viewerRole !== MembershipRole.member;
  const isAdmin = viewerRole === MembershipRole.owner || viewerRole === MembershipRole.family_admin;

  // Lọc tìm kiếm
  const filteredPeople = people.filter((p) => {
    const nameMatch = p.primaryName.toLowerCase().includes(searchQuery.toLowerCase());
    const addressMatch = (p.currentAddress || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || addressMatch;
  });

  const resetForm = () => {
    setPrimaryName('');
    setGender('unknown');
    setLifeStatus('living');
    setBirthYear('');
    setBirthDateValue('');
    setDeathYear('');
    setDeathDateValue('');
    setPhone('');
    setEmail('');
    setCurrentAddress('');
    setBiographyPublic('');
    setPrivacyLevel('normal');
    setBranchId('');
    setError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName) {
      setError('Họ và tên bắt buộc phải có.');
      return;
    }

    startTransition(async () => {
      try {
        const familyId = initialPeople[0]?.familyId || '';
        if (!familyId) throw new Error('Không thể xác định ID gia tộc.');

        const newPerson = await createPersonAction(familyId, {
          primaryName,
          gender,
          lifeStatus,
          birthYear,
          birthDateValue: birthDateValue || null,
          deathYear: lifeStatus === 'deceased' ? deathYear : null,
          deathDateValue: lifeStatus === 'deceased' && deathDateValue ? deathDateValue : null,
          phone,
          email,
          currentAddress,
          biographyPublic,
          privacyLevel,
          branchId: branchId || null,
        });

        setPeople([...people, newPerson]);
        setIsAddOpen(false);
        resetForm();
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tạo mới.');
      }
    });
  };

  const handleEditClick = (person: any) => {
    setSelectedPerson(person);
    setPrimaryName(person.primaryName);
    setGender(person.gender);
    setLifeStatus(person.lifeStatus);
    setBirthYear(person.birthYear?.toString() || '');
    setBirthDateValue(person.birthDateValue ? new Date(person.birthDateValue).toISOString().slice(0, 10) : '');
    setDeathYear(person.deathYear?.toString() || '');
    setDeathDateValue(person.deathDateValue ? new Date(person.deathDateValue).toISOString().slice(0, 10) : '');
    setPhone(person.phone || '');
    setEmail(person.email || '');
    setCurrentAddress(person.currentAddress || '');
    setBiographyPublic(person.biographyPublic || '');
    setPrivacyLevel(person.privacyLevel);
    setBranchId(person.branchId || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    if (!primaryName) {
      setError('Họ và tên bắt buộc.');
      return;
    }

    startTransition(async () => {
      try {
        const updated = await updatePersonAction(selectedPerson.id, {
          primaryName,
          gender,
          lifeStatus,
          birthYear,
          birthDateValue: birthDateValue || null,
          deathYear: lifeStatus === 'deceased' ? deathYear : null,
          deathDateValue: lifeStatus === 'deceased' && deathDateValue ? deathDateValue : null,
          phone,
          email,
          currentAddress,
          biographyPublic,
          privacyLevel,
          branchId: branchId || null,
        });

        setPeople(people.map((p) => (p.id === selectedPerson.id ? { ...p, ...updated } : p)));
        setIsEditOpen(false);
        resetForm();
      } catch (err: any) {
        setError(err.message || 'Lỗi khi cập nhật.');
      }
    });
  };

  const handleArchiveClick = (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ thành viên "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        await archivePersonAction(id);
        setPeople(people.filter((p) => p.id !== id));
      } catch (err: any) {
        alert(err.message || 'Lỗi xảy ra.');
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-zinc-200 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc địa chỉ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white border border-zinc-200 px-4 py-2 text-xs text-zinc-800 rounded-xl focus:outline-none focus:border-indigo-500 transition-all w-full md:max-w-md"
        />

        {isEditor && (
          <button
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md self-start md:self-auto"
          >
            ＋ Thêm Thành Viên
          </button>
        )}
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPeople.map((person) => (
          <div key={person.id} className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between shadow-sm">
            
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">{person.primaryName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                    Đời {person.generationDisplay}
                    {person.branchId && ` • Chi ${branches.find(b => b.id === person.branchId)?.name}`}
                  </p>
                </div>
                
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                  person.privacyLevel === 'sensitive' ? 'bg-amber-55 text-amber-700 border border-amber-200' :
                  person.privacyLevel === 'private' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-zinc-100 text-zinc-500'
                }`}>
                  {person.privacyLevel}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-zinc-600 font-sans">
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Trạng thái:</span>
                  <span>{person.isLiving ? '🟢 Còn sống' : '⚪ Đã mất'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">Năm sinh:</span>
                  <span>{person.birthYear || 'Không rõ'}</span>
                </div>
                {!person.isLiving && (
                  <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                    <span className="text-zinc-400">Năm mất:</span>
                    <span>{person.deathYear || 'Không rõ'}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-zinc-50 pb-1.5">
                  <span className="text-zinc-400">SĐT:</span>
                  <span>{person.phone || (person.privacyMasked ? '🔒 Bị ẩn' : 'Không có')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Địa chỉ:</span>
                  <span>{person.currentAddress || (person.privacyMasked ? '🔒 Bị ẩn' : 'Không có')}</span>
                </div>
              </div>

              {person.biographyPublic && (
                <p className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                  "{person.biographyPublic}"
                </p>
              )}
            </div>

            {isEditor && (
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 mt-auto">
                <button
                  onClick={() => handleEditClick(person)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-700 transition-colors border border-zinc-200"
                >
                  ✏️ Sửa
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleArchiveClick(person.id, person.primaryName)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 border border-red-200 transition-colors ml-auto"
                  >
                    🗑️ Lưu trữ
                  </button>
                )}
              </div>
            )}

          </div>
        ))}
      </div>

      {/* --- ADD / EDIT MODALS --- */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-xl text-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-950">
                {isAddOpen ? '＋ Thêm Thành Viên Mới' : `✏️ Sửa hồ sơ: ${selectedPerson?.primaryName}`}
              </h3>
              <button
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}
                className="text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={primaryName}
                    onChange={(e) => setPrimaryName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="unknown">Chưa rõ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Trạng thái</label>
                  <select
                    value={lifeStatus}
                    onChange={(e) => setLifeStatus(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  >
                    <option value="living">Còn sống</option>
                    <option value="deceased">Đã mất</option>
                    <option value="unknown">Chưa rõ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Năm sinh</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="VD: 1980"
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Ngày sinh đầy đủ</label>
                  <input
                    type="date"
                    value={birthDateValue}
                    onChange={(e) => setBirthDateValue(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                {lifeStatus === 'deceased' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-500 uppercase tracking-wider">Năm mất</label>
                      <input
                        type="number"
                        value={deathYear}
                        onChange={(e) => setDeathYear(e.target.value)}
                        placeholder="VD: 2015"
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-500 uppercase tracking-wider">Ngày mất đầy đủ</label>
                      <input
                        type="date"
                        value={deathDateValue}
                        onChange={(e) => setDeathDateValue(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Chi / Phái</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  >
                    <option value="">Không thuộc chi nhánh riêng</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Địa chỉ hiện tại</label>
                  <input
                    type="text"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Quyền riêng tư</label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  >
                    <option value="normal">Normal (Tất cả)</option>
                    <option value="restricted">Restricted (Hạn chế)</option>
                    <option value="sensitive">Sensitive (Chỉ editor+)</option>
                    <option value="private">Private (Chỉ owner/admin)</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-zinc-500 uppercase tracking-wider">Tiểu sử</label>
                  <textarea
                    rows={3}
                    value={biographyPublic}
                    onChange={(e) => setBiographyPublic(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 font-semibold border border-zinc-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu Thay đổi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
