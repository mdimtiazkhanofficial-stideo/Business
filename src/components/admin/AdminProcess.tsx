import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProcessStep } from '../../types';
import { Layers, Plus, Trash2, Edit2, PlayCircle, Image, ArrowLeft, X } from 'lucide-react';

export const AdminProcess: React.FC = () => {
  const { processSteps, saveProcessStep, deleteProcessStep, showToast } = useStore();
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [stepNumber, setStepNumber] = useState<number | string>('');

  const openCreateForm = () => {
    setEditingStep(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setVideoUrl('');
    setStepNumber('');
    setIsEditingMode(true);
  };

  const openEditForm = (step: ProcessStep) => {
    setEditingStep(step);
    setTitle(step.title);
    setDescription(step.short_description);
    setImageUrl(step.image_url);
    setVideoUrl(step.video_url || '');
    setStepNumber(step.display_order);
    setIsEditingMode(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !imageUrl.trim()) {
      showToast('Title, description and image are required', 'error');
      return;
    }

    const newStep: ProcessStep = {
      id: editingStep ? editingStep.id : `proc-${Date.now()}`,
      display_order: Number(stepNumber) || processSteps.length + 1,
      title,
      short_description: description,
      image_url: imageUrl,
      video_url: videoUrl,
      status: 'active'
    };

    await saveProcessStep(newStep);
    setIsEditingMode(false);
  };

  return (
    <div className="space-y-5">
      {isEditingMode ? (
        <div className="bg-white border border-stone-200 rounded-xs shadow-2xs">
          <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditingMode(false)}
                className="p-2 border border-stone-200 bg-white hover:bg-stone-100 rounded-xs text-stone-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-wider font-serif">
                  {editingStep ? 'Edit Process Step' : 'Add New Process Step'}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure quality standards and visuals for customer transparency.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingMode(false)}
              className="text-stone-400 hover:text-stone-700 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-w-2xl">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Step #</label>
                <input
                  type="number"
                  min={1}
                  value={stepNumber}
                  onChange={(e) => setStepNumber(e.target.value)}
                  placeholder="Enter step number"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs bg-[#FFFDF7]"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold text-stone-700 uppercase mb-1">Step Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter step title"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xs bg-[#FFFDF7]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter step description"
                className="w-full px-3 py-2 border border-stone-300 rounded-xs resize-none bg-[#FFFDF7]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Image URL *</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter step image URL"
                className="w-full px-3 py-2 border border-stone-300 rounded-xs bg-[#FFFDF7]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Video Clip URL (Optional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL (optional)"
                className="w-full px-3 py-2 border border-stone-300 rounded-xs bg-[#FFFDF7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsEditingMode(false)}
                className="px-4 py-2 border border-stone-300 text-stone-600 hover:text-stone-800 font-bold uppercase rounded-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#1B4332] text-white px-5 py-2 font-bold uppercase rounded-xs hover:bg-[#2D6A4F] shadow-xs"
              >
                Save Step
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif uppercase tracking-wide">
                "From Farm To Pack" Quality Process
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Configure the 4-step story highlighting natural sourcing, sorting, drying, and hygienic vacuum packaging.
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="bg-[#1B4332] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#2D6A4F] transition-colors rounded-xs shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Process Step</span>
            </button>
          </div>

          {/* List of Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processSteps.map((step) => (
              <div
                key={step.id}
                className="bg-white border border-stone-200 p-4 rounded-xs shadow-2xs flex gap-4 relative group"
              >
                <div className="w-24 h-24 bg-stone-100 rounded-xs overflow-hidden shrink-0 border border-stone-200">
                  <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-stone-100 text-[#1B4332] font-black text-xs px-2 py-0.5 rounded-full">
                      Step {step.display_order}
                    </span>
                    {step.video_url && (
                      <span className="text-stone-400 flex items-center gap-1 text-[10px]">
                        <PlayCircle className="w-3 h-3 text-red-600" /> Video attached
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm truncate">{step.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{step.short_description}</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => openEditForm(step)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xs"
                    title="Edit Step"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this step?')) {
                        deleteProcessStep(step.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xs"
                    title="Delete Step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
