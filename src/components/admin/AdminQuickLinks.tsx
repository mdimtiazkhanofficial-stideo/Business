import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { QuickLinkItem, QuickLinkSectionItem } from '../../types';
import {
  Link2,
  Edit3,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Users,
  AlertTriangle,
  Eye,
  ListChecks
} from 'lucide-react';

const POLICY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'terms-and-conditions': FileText,
  'privacy-policy': ShieldCheck,
  'shipping-and-delivery': Truck,
  'return-and-refund': RotateCcw,
  'payment-policy': CreditCard,
  'customer-rules': Users,
  'report-an-issue': AlertTriangle
};

export const AdminQuickLinks: React.FC = () => {
  const { quickLinks, saveQuickLink, saveQuickLinksList, settings, showToast } = useStore();

  const [filterType, setFilterType] = useState<'all' | 'quick_link' | 'policy'>('all');
  const [editingItem, setEditingItem] = useState<QuickLinkItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const companyName = settings.company_name || settings.store_name || 'SHAD SODAI';

  const sortedLinks = useMemo(() => {
    return [...quickLinks].sort(
      (a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99)
    );
  }, [quickLinks]);

  const filteredLinks = useMemo(() => {
    if (filterType === 'all') return sortedLinks;
    return sortedLinks.filter((item) => item.type === filterType);
  }, [sortedLinks, filterType]);

  // Toggle Active/Inactive directly from listing
  const handleToggleActive = async (item: QuickLinkItem) => {
    const updated: QuickLinkItem = {
      ...item,
      is_active: !item.is_active,
      updated_at: new Date().toISOString()
    };
    await saveQuickLink(updated);
  };

  // Change Display Order directly from listing
  const handleOrderChange = async (item: QuickLinkItem, newOrder: number) => {
    const updatedList = sortedLinks.map((l) =>
      l.id === item.id ? { ...l, display_order: Math.max(1, newOrder) } : l
    );
    await saveQuickLinksList(updatedList);
  };

  // Move item Up / Down in listing
  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredLinks.length) return;

    const currentItem = filteredLinks[index];
    const swapItem = filteredLinks[targetIndex];

    const currentOrder = currentItem.display_order;
    const swapOrder = swapItem.display_order;

    const updatedList = sortedLinks.map((l) => {
      if (l.id === currentItem.id) {
        return { ...l, display_order: swapOrder === currentOrder ? targetIndex + 1 : swapOrder };
      }
      if (l.id === swapItem.id) {
        return { ...l, display_order: swapOrder === currentOrder ? index + 1 : currentOrder };
      }
      return l;
    });

    await saveQuickLinksList(updatedList);
  };

  // Open Editor for an item
  const handleOpenEditor = (item: QuickLinkItem) => {
    const sectionsCopy: QuickLinkSectionItem[] = (item.sections || [])
      .map((s, idx) => ({
        ...s,
        section_number: Number(s.section_number) || idx + 1,
        display_order: Number(s.display_order) || idx + 1,
        bullet_points: Array.isArray(s.bullet_points) ? [...s.bullet_points] : []
      }))
      .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

    setEditingItem({
      ...item,
      page_title: item.page_title || item.title.toUpperCase(),
      short_description: item.short_description || '',
      sections: sectionsCopy
    });
  };

  // Add a new content section in Editor
  const handleAddSection = () => {
    if (!editingItem) return;
    const currentSections = editingItem.sections || [];
    const nextNum = currentSections.length + 1;
    const now = new Date().toISOString();

    const newSection: QuickLinkSectionItem = {
      id: `sec-${editingItem.slug}-${Date.now()}`,
      quick_link_id: editingItem.id,
      section_number: nextNum,
      heading: '',
      content: '',
      bullet_points: [],
      display_order: nextNum,
      is_active: true,
      created_at: now,
      updated_at: now
    };

    setEditingItem({
      ...editingItem,
      sections: [...currentSections, newSection]
    });
  };

  // Update a specific section field
  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<QuickLinkSectionItem>
  ) => {
    if (!editingItem) return;
    const updatedSections = (editingItem.sections || []).map((sec) =>
      sec.id === sectionId
        ? { ...sec, ...updates, updated_at: new Date().toISOString() }
        : sec
    );
    setEditingItem({
      ...editingItem,
      sections: updatedSections
    });
  };

  // Delete a section
  const handleDeleteSection = (sectionId: string) => {
    if (!editingItem) return;
    const remaining = (editingItem.sections || [])
      .filter((sec) => sec.id !== sectionId)
      .map((sec, idx) => ({
        ...sec,
        section_number: idx + 1,
        display_order: idx + 1
      }));
    setEditingItem({
      ...editingItem,
      sections: remaining
    });
  };

  // Move section Up or Down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!editingItem || !editingItem.sections) return;
    const sections = [...editingItem.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    const renumbered = sections.map((sec, idx) => ({
      ...sec,
      section_number: idx + 1,
      display_order: idx + 1
    }));

    setEditingItem({
      ...editingItem,
      sections: renumbered
    });
  };

  // Add a bullet point to a section
  const handleAddBulletPoint = (sectionId: string) => {
    if (!editingItem) return;
    const sec = (editingItem.sections || []).find((s) => s.id === sectionId);
    if (!sec) return;
    handleUpdateSection(sectionId, {
      bullet_points: [...(sec.bullet_points || []), '']
    });
  };

  // Update a specific bullet point
  const handleUpdateBulletPoint = (
    sectionId: string,
    bulletIdx: number,
    value: string
  ) => {
    if (!editingItem) return;
    const sec = (editingItem.sections || []).find((s) => s.id === sectionId);
    if (!sec) return;
    const nextBullets = [...(sec.bullet_points || [])];
    nextBullets[bulletIdx] = value;
    handleUpdateSection(sectionId, { bullet_points: nextBullets });
  };

  // Remove a specific bullet point
  const handleRemoveBulletPoint = (sectionId: string, bulletIdx: number) => {
    if (!editingItem) return;
    const sec = (editingItem.sections || []).find((s) => s.id === sectionId);
    if (!sec) return;
    const nextBullets = (sec.bullet_points || []).filter((_, i) => i !== bulletIdx);
    handleUpdateSection(sectionId, { bullet_points: nextBullets });
  };

  // Save edited Quick Link / Policy Page
  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title.trim()) {
      showToast('Link title is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const cleanedSections = (editingItem.sections || [])
        .map((s, idx) => ({
          ...s,
          section_number: Number(s.section_number) || idx + 1,
          heading: s.heading.trim(),
          content: s.content.trim(),
          bullet_points: (s.bullet_points || []).map((b) => b.trim()).filter(Boolean),
          display_order: Number(s.display_order) || idx + 1
        }))
        .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

      const payload: QuickLinkItem = {
        ...editingItem,
        title: editingItem.title.trim(),
        page_title: (editingItem.page_title || editingItem.title).trim(),
        short_description: (editingItem.short_description || '').trim(),
        sections: cleanedSections,
        updated_at: new Date().toISOString()
      };

      await saveQuickLink(payload);
      setEditingItem(null);
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // RENDER: POLICY / PAGE EDITOR VIEW
  // ============================================================================
  if (editingItem) {
    const ActiveIcon = POLICY_ICONS[editingItem.slug] || FileText;
    const activePreviewSections = (editingItem.sections || [])
      .filter((s) => s.is_active !== false)
      .sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

    return (
      <div className="space-y-6 pb-12">
        {/* Top Action Bar */}
        <div className="bg-white border border-stone-200 rounded-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="p-2 border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-xs transition-colors cursor-pointer"
              title="Back to Quick Links"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332]">
                  {editingItem.type === 'policy' ? 'Policy / Page Editor' : 'Quick Link Editor'}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] font-mono text-stone-500">{editingItem.url}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 font-serif uppercase tracking-tight">
                Edit: {editingItem.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {editingItem.type === 'policy' && (
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="px-3 py-2 border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showLivePreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
            )}

            <Link
              to={editingItem.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Page</span>
            </Link>

            <button
              type="button"
              onClick={handleSaveEditor}
              disabled={isSaving}
              className="px-4 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveEditor} className="space-y-6">
          {/* Page Header & Link Configuration Card */}
          <div className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase font-serif">
                  Page Header & Link Settings
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure the footer link label, page heading, short description, display order, and active status.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingItem({ ...editingItem, is_active: !editingItem.is_active })
                }
                className={`px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  editingItem.is_active
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border border-stone-300'
                }`}
              >
                {editingItem.is_active ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-stone-500" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase block">
                  Footer Link Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Return & Refund Policy"
                  className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase block">
                  Page Title (Header)
                </label>
                <input
                  type="text"
                  value={editingItem.page_title || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, page_title: e.target.value })
                  }
                  placeholder="e.g. RETURN & REFUND POLICY"
                  className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase block">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingItem.display_order}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      display_order: Math.max(1, Number(e.target.value) || 1)
                    })
                  }
                  className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs font-mono font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-xs font-bold text-stone-700 uppercase block">
                  Short Description (Subtitle below Page Title)
                </label>
                <input
                  type="text"
                  value={editingItem.short_description || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, short_description: e.target.value })
                  }
                  placeholder="e.g. Hassle-free 7-day size exchange, return eligibility, and refund processing."
                  className="w-full bg-[#FFFDF7] border border-stone-300 px-3 py-2 text-xs text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Section Content Builder & Live Preview Grid */}
          {editingItem.type === 'policy' && (
            <div
              className={`grid grid-cols-1 ${
                showLivePreview ? 'xl:grid-cols-12' : ''
              } gap-6 items-start`}
            >
              {/* Left Column: Section Content Editor */}
              <div className={`${showLivePreview ? 'xl:col-span-7' : ''} space-y-4`}>
                <div className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 uppercase font-serif flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-[#1B4332]" />
                        <span>Section Content ({(editingItem.sections || []).length})</span>
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Add, edit, delete, or reorder numbered policy sections, paragraphs, and bullet points.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3.5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Section</span>
                    </button>
                  </div>

                  {(editingItem.sections || []).length === 0 ? (
                    <div className="p-8 text-center bg-[#FFFDF7] border border-dashed border-stone-300 rounded-xs space-y-2">
                      <p className="text-xs font-bold text-stone-700 uppercase">
                        No Content Sections Added Yet
                      </p>
                      <p className="text-xs text-stone-500">
                        Click &ldquo;Add New Section&rdquo; to create numbered sections with descriptions and bullet points.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(editingItem.sections || []).map((section, idx) => (
                        <div
                          key={section.id}
                          className={`p-4 sm:p-5 rounded-xs border transition-colors space-y-4 ${
                            section.is_active !== false
                              ? 'bg-[#FFFDF7] border-stone-300'
                              : 'bg-stone-100/70 border-stone-200 opacity-75'
                          }`}
                        >
                          {/* Section Top Bar: Number, Order Controls, Active Toggle, Delete */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#1B4332] text-white text-[11px] font-mono font-bold rounded-xs">
                                Section #{section.section_number}
                              </span>
                              <span className="text-xs font-bold text-stone-800 truncate max-w-[220px] sm:max-w-xs font-serif">
                                {section.heading || 'Untitled Section'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Reorder Up/Down */}
                              <button
                                type="button"
                                onClick={() => handleMoveSection(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Section Up"
                                className="p-1.5 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 rounded-xs disabled:opacity-40 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSection(idx, 'down')}
                                disabled={idx === (editingItem.sections || []).length - 1}
                                title="Move Section Down"
                                className="p-1.5 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 rounded-xs disabled:opacity-40 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Active/Inactive Toggle */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSection(section.id, {
                                    is_active: section.is_active === false
                                  })
                                }
                                className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-xs border cursor-pointer ${
                                  section.is_active !== false
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-stone-200 text-stone-600 border-stone-300'
                                }`}
                              >
                                {section.is_active !== false ? 'Active' : 'Inactive'}
                              </button>

                              {/* Delete Section */}
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                title="Delete Section"
                                className="p-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xs cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Section Number, Heading, Display Order */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-stone-700 uppercase block">
                                Sec No.
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={section.section_number}
                                onChange={(e) =>
                                  handleUpdateSection(section.id, {
                                    section_number: Math.max(1, Number(e.target.value) || 1)
                                  })
                                }
                                className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                              />
                            </div>

                            <div className="sm:col-span-8 space-y-1">
                              <label className="text-[11px] font-bold text-stone-700 uppercase block">
                                Section Heading *
                              </label>
                              <input
                                type="text"
                                value={section.heading}
                                onChange={(e) =>
                                  handleUpdateSection(section.id, { heading: e.target.value })
                                }
                                placeholder="e.g. 7-Day Easy Size Exchange & Return"
                                className="w-full bg-white border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                              />
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-stone-700 uppercase block">
                                Order
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={section.display_order}
                                onChange={(e) =>
                                  handleUpdateSection(section.id, {
                                    display_order: Math.max(1, Number(e.target.value) || 1)
                                  })
                                }
                                className="w-full bg-white border border-stone-300 px-2.5 py-1.5 text-xs font-mono font-bold text-stone-900 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                              />
                            </div>
                          </div>

                          {/* Description / Full Text */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-stone-700 uppercase block">
                              Description / Full Text
                            </label>
                            <textarea
                              rows={3}
                              value={section.content}
                              onChange={(e) =>
                                handleUpdateSection(section.id, { content: e.target.value })
                              }
                              placeholder="Enter paragraph description for this section..."
                              className="w-full bg-white border border-stone-300 px-3 py-2 text-xs text-stone-800 rounded-xs focus:outline-hidden focus:border-[#1B4332] leading-relaxed"
                            />
                          </div>

                          {/* Bullet Points */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-stone-700 uppercase block">
                                Bullet Points ({(section.bullet_points || []).length})
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddBulletPoint(section.id)}
                                className="px-2.5 py-1 bg-white border border-stone-300 hover:border-[#1B4332] text-[#1B4332] text-[11px] font-bold uppercase rounded-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Bullet Point</span>
                              </button>
                            </div>

                            {(section.bullet_points || []).length > 0 && (
                              <div className="space-y-2">
                                {(section.bullet_points || []).map((bp, bpIdx) => (
                                  <div key={bpIdx} className="flex items-center gap-2">
                                    <span className="text-stone-500 font-bold text-sm">•</span>
                                    <input
                                      type="text"
                                      value={bp}
                                      onChange={(e) =>
                                        handleUpdateBulletPoint(
                                          section.id,
                                          bpIdx,
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g. The garment must be unworn, unwashed, and in its original condition."
                                      className="flex-1 bg-white border border-stone-300 px-3 py-1.5 text-xs text-stone-800 rounded-xs focus:outline-hidden focus:border-[#1B4332]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveBulletPoint(section.id, bpIdx)
                                      }
                                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-xs cursor-pointer"
                                      title="Remove bullet point"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Customer Page Preview (Matches Screenshot Design) */}
              {showLivePreview && (
                <div className="xl:col-span-5 xl:sticky xl:top-20 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Customer Storefront Live Preview
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {editingItem.url}
                    </span>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xs shadow-2xs overflow-hidden">
                    {/* Header matching Screenshot */}
                    <div className="bg-stone-50 border-b border-stone-200 p-5 flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xs bg-[#1B4332] text-white flex items-center justify-center shrink-0">
                        <ActiveIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332] block">
                          {companyName}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-stone-900 font-serif uppercase tracking-tight">
                          {editingItem.page_title || editingItem.title}
                        </h3>
                        {editingItem.short_description && (
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {editingItem.short_description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sections matching Screenshot */}
                    <div className="p-5 space-y-3.5">
                      {activePreviewSections.length === 0 ? (
                        <p className="text-xs text-stone-400 italic text-center py-6">
                          No active sections to display.
                        </p>
                      ) : (
                        activePreviewSections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-4 bg-[#FFFDF7] border border-stone-200/90 rounded-xs space-y-1.5"
                          >
                            <h4 className="text-sm font-bold text-stone-900 font-serif">
                              {sec.section_number}. {sec.heading}
                            </h4>
                            {sec.content && (
                              <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                                {sec.content}
                              </p>
                            )}
                            {sec.bullet_points &&
                              sec.bullet_points.filter((b) => b.trim()).length > 0 && (
                                <ul className="space-y-1 pt-0.5">
                                  {sec.bullet_points
                                    .filter((b) => b.trim())
                                    .map((bp, i) => (
                                      <li
                                        key={i}
                                        className="text-xs text-stone-700 leading-relaxed flex items-start gap-2"
                                      >
                                        <span className="text-stone-800 font-bold">•</span>
                                        <span>{bp}</span>
                                      </li>
                                    ))}
                                </ul>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="bg-white border border-stone-200 rounded-xs p-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // RENDER: QUICK LINKS LISTING VIEW (All 13 Items)
  // ============================================================================
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#1B4332]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332]">
              Footer & Policy CMS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif uppercase tracking-tight">
            Quick Links & Policy Pages
          </h1>
          <p className="text-xs text-stone-600">
            Manage all 13 Footer Quick Links and Terms &amp; Policies pages, display order, active visibility, and structured section content.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 rounded-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#1B4332] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({sortedLinks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('quick_link')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
              filterType === 'quick_link'
                ? 'bg-[#1B4332] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Quick Links ({sortedLinks.filter((l) => l.type === 'quick_link').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('policy')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
              filterType === 'policy'
                ? 'bg-[#1B4332] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Terms &amp; Policies ({sortedLinks.filter((l) => l.type === 'policy').length})
          </button>
        </div>
      </div>

      {/* Quick Links Listing Table / Cards */}
      <div className="bg-white border border-stone-200 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-14">#</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4 hidden md:table-cell">Footer Group</th>
                <th className="py-3 px-4 hidden lg:table-cell">Direct Route &amp; Sections</th>
                <th className="py-3 px-4 w-36">Display Order</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-xs">
              {filteredLinks.map((item, idx) => {
                const sectionCount = (item.sections || []).length;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      !item.is_active ? 'opacity-65 bg-stone-50/40' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                      {idx + 1}
                    </td>

                    {/* Title & Subtitle */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 text-xs sm:text-sm">
                        {item.title}
                      </div>
                      {item.short_description && (
                        <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {item.short_description}
                        </div>
                      )}
                      <div className="md:hidden text-[10px] font-mono text-stone-400 mt-0.5">
                        {item.type === 'policy' ? 'Terms & Policies' : 'Quick Links'} · {item.url}
                      </div>
                    </td>

                    {/* Group */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="text-xs font-semibold text-stone-700">
                        {item.type === 'policy' ? 'Terms & Policies' : 'Quick Links'}
                      </span>
                    </td>

                    {/* Direct Route & Sections Info */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <span className="font-mono text-[11px] text-stone-700">{item.url}</span>
                        {item.type === 'policy' && (
                          <>
                            <span className="text-stone-300">·</span>
                            <span className="text-[11px] text-[#1B4332] font-semibold">
                              {sectionCount} {sectionCount === 1 ? 'Section' : 'Sections'}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          value={item.display_order}
                          onChange={(e) =>
                            handleOrderChange(item, Number(e.target.value) || 1)
                          }
                          className="w-14 bg-[#FFFDF7] border border-stone-300 px-2 py-1 text-xs font-mono font-bold text-stone-900 rounded-xs text-center focus:outline-hidden focus:border-[#1B4332]"
                        />
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1 border border-stone-200 hover:bg-stone-100 text-stone-600 rounded-xs disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === filteredLinks.length - 1}
                          title="Move Down"
                          className="p-1 border border-stone-200 hover:bg-stone-100 text-stone-600 rounded-xs disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Active / Inactive Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-1 rounded-xs text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-stone-500 shrink-0" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit & Preview */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditor(item)}
                          className="px-3 py-1.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[11px] font-bold uppercase tracking-wider rounded-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <Link
                          to={item.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Page"
                          className="p-1.5 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xs transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
