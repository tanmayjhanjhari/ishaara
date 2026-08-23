import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import { Card, StatTile, Button, Input, Modal, Badge, Spinner } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import client from '../api/client'
import { Users, Activity, Award, ShieldAlert, Plus, ChevronDown, ChevronUp, FileText, Settings, BookOpen } from 'lucide-react'

export default function Admin() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  // Tab state: 'signs' | 'lessons'
  const [activeTab, setActiveTab] = useState('signs')

  // Data states
  const [stats, setStats] = useState(null)
  const [signs, setSigns] = useState([])
  const [lessons, setLessons] = useState([])

  // Loading and error states
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingSigns, setLoadingSigns] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Collapsible panel state
  const [showCreateSign, setShowCreateSign] = useState(false)

  // Edit sign state
  const [editingSign, setEditingSign] = useState(null)
  const [editForm, setEditForm] = useState({
    label: '',
    category: '',
    difficulty: 1,
    xp_reward: 10,
    video_url: ''
  })

  // Create sign state
  const [newSign, setNewSign] = useState({
    slug: '',
    label: '',
    category: 'alphabet',
    difficulty: 1,
    xp_reward: 10
  })

  // Check auth
  useEffect(() => {
    if (!user || !user.is_staff) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const res = await client.get('/api/v1/admin/stats/')
      setStats(res.data.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setErrorMsg('Failed to load admin stats.')
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchSigns = async () => {
    try {
      setLoadingSigns(true)
      const res = await client.get('/api/v1/admin/signs/')
      setSigns(res.data.data)
    } catch (err) {
      console.error('Failed to fetch signs:', err)
    } finally {
      setLoadingSigns(false)
    }
  }

  const fetchLessons = async () => {
    try {
      setLoadingLessons(true)
      const res = await client.get('/api/v1/admin/lessons/')
      setLessons(res.data.data)
    } catch (err) {
      console.error('Failed to fetch lessons:', err)
    } finally {
      setLoadingLessons(false)
    }
  }

  useEffect(() => {
    if (user?.is_staff) {
      fetchStats()
      fetchSigns()
      fetchLessons()
    }
  }, [user])

  const handleOpenEditModal = (sign) => {
    setEditingSign(sign)
    setEditForm({
      label: sign.label,
      category: sign.category,
      difficulty: sign.difficulty,
      xp_reward: sign.xp_reward,
      video_url: sign.video_url || ''
    })
  }

  const handleSaveSign = async (e) => {
    e.preventDefault()
    try {
      await client.put(`/api/v1/admin/signs/${editingSign.id}/`, editForm)
      setEditingSign(null)
      fetchSigns()
      fetchStats()
    } catch (err) {
      console.error('Error saving sign:', err)
    }
  }

  const handleCreateSign = async (e) => {
    e.preventDefault()
    try {
      await client.post('/api/v1/admin/signs/', newSign)
      setNewSign({
        slug: '',
        label: '',
        category: 'alphabet',
        difficulty: 1,
        xp_reward: 10
      })
      setShowCreateSign(false)
      fetchSigns()
      fetchStats()
    } catch (err) {
      console.error('Error creating sign:', err)
    }
  }

  const handleTogglePublish = async (lesson) => {
    try {
      await client.put(`/api/v1/admin/lessons/${lesson.id}/`, {
        is_published: !lesson.is_published
      })
      fetchLessons()
    } catch (err) {
      console.error('Error toggling publish status:', err)
    }
  }

  const renderDifficultyBadge = (difficulty) => {
    if (difficulty === 1) {
      return <Badge variant="success" size="sm">Easy</Badge>
    }
    if (difficulty === 2) {
      return <Badge variant="warning" size="sm">Medium</Badge>
    }
    if (difficulty === 3) {
      return <Badge variant="error" size="sm">Challenging</Badge>
    }
    return null
  }

  if (!user || !user.is_staff) {
    return null
  }

  return (
    <PageWrapper>
      <div className="space-y-8 animate-fade-up">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-display font-extrabold text-text-primary tracking-tight flex items-center gap-3">
              <Settings className="text-primary w-8 h-8 animate-spin-slow" />
              Admin Panel
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Platform content management, usage stats, and curriculum customization.
            </p>
          </div>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-error/10 border border-error/25 text-error-light px-4 py-3 rounded-xl">
            <ShieldAlert size={18} />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Stats Row */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="h-28 flex items-center justify-center">
                <Spinner size="sm" />
              </Card>
            ))}
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <StatTile
                label="Total Users"
                value={stats.total_users.toLocaleString()}
                icon={Users}
              />
              <StatTile
                label="Active Today"
                value={stats.active_today.toLocaleString()}
                icon={Activity}
              />
              <StatTile
                label="Total Attempts"
                value={stats.total_attempts.toLocaleString()}
                icon={Award}
              />
              <StatTile
                label="Total Signs"
                value={stats.total_signs.toLocaleString()}
                icon={FileText}
              />
            </div>
          )
        )}

        {/* Main tabs */}
        <div className="flex gap-6 border-b border-white/5">
          <button
            onClick={() => setActiveTab('signs')}
            className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative ${
              activeTab === 'signs' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Signs Management
            {activeTab === 'signs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative ${
              activeTab === 'lessons' ? 'text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Lessons Management
            {activeTab === 'lessons' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}
          </button>
        </div>

        {/* Tab content: Signs */}
        {activeTab === 'signs' && (
          <div className="space-y-6">
            {/* Create Sign Accordion Panel */}
            <div className="border border-white/5 bg-surface-1/30 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowCreateSign(!showCreateSign)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="text-primary w-5 h-5" />
                  <span className="font-bold text-text-primary text-sm">Create New Sign</span>
                </div>
                {showCreateSign ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showCreateSign && (
                <form onSubmit={handleCreateSign} className="p-6 border-t border-white/5 bg-surface-2/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Slug"
                      placeholder="e.g. sign-z"
                      value={newSign.slug}
                      onChange={(e) => setNewSign({ ...newSign, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                    <Input
                      label="Label"
                      placeholder="e.g. Z"
                      value={newSign.label}
                      onChange={(e) => setNewSign({ ...newSign, label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Category"
                      placeholder="e.g. alphabet"
                      value={newSign.category}
                      onChange={(e) => setNewSign({ ...newSign, category: e.target.value })}
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-muted">Difficulty</label>
                      <select
                        value={newSign.difficulty}
                        onChange={(e) => setNewSign({ ...newSign, difficulty: parseInt(e.target.value) })}
                        className="w-full rounded-lg bg-surface-2/40 border border-white/5 backdrop-blur-sm text-text-primary py-2 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                      >
                        <option value={1}>Easy</option>
                        <option value={2}>Medium</option>
                        <option value={3}>Challenging</option>
                      </select>
                    </div>
                    <Input
                      label="XP Reward"
                      type="number"
                      value={newSign.xp_reward}
                      onChange={(e) => setNewSign({ ...newSign, xp_reward: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="submit" variant="primary">
                      Create Sign
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Signs Table */}
            {loadingSigns ? (
              <div className="flex items-center justify-center p-12">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-surface-1/20 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest text-text-muted">
                      <th className="p-4 pl-6">Label</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Difficulty</th>
                      <th className="p-4">XP Reward</th>
                      <th className="p-4">Has Reference</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-text-secondary">
                    {signs.map((sign) => (
                      <tr key={sign.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6 font-bold text-text-primary">{sign.label}</td>
                        <td className="p-4 font-mono text-xs text-text-muted">{sign.slug}</td>
                        <td className="p-4 capitalize">{sign.category}</td>
                        <td className="p-4">{renderDifficultyBadge(sign.difficulty)}</td>
                        <td className="p-4 font-semibold text-indigo-400">{sign.xp_reward} XP</td>
                        <td className="p-4">
                          {sign.reference_landmarks ? (
                            <Badge variant="success" size="sm">Yes</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">No Reference</Badge>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditModal(sign)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab content: Lessons */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {loadingLessons ? (
              <div className="flex items-center justify-center p-12">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-surface-1/20 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-xs font-black uppercase tracking-widest text-text-muted">
                      <th className="p-4 pl-6">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Signs Count</th>
                      <th className="p-4">Req. Level</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-text-secondary">
                    {lessons.map((lesson) => (
                      <tr key={lesson.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6 font-bold text-text-primary">{lesson.title}</td>
                        <td className="p-4 capitalize">{lesson.category}</td>
                        <td className="p-4 font-semibold">{lesson.sign_count} signs</td>
                        <td className="p-4 font-mono">Level {lesson.required_level}</td>
                        <td className="p-4">
                          {lesson.is_published ? (
                            <Badge variant="success" size="sm">Published</Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">Draft</Badge>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            variant={lesson.is_published ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleTogglePublish(lesson)}
                          >
                            {lesson.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EditSignModal */}
      {editingSign && (
        <Modal
          isOpen={!!editingSign}
          onClose={() => setEditingSign(null)}
          title={`Edit Sign: ${editingSign.label}`}
          size="md"
        >
          <form onSubmit={handleSaveSign} className="space-y-4 pt-2">
            <Input
              label="Label"
              value={editForm.label}
              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
              required
            />
            <Input
              label="Category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Difficulty</label>
              <select
                value={editForm.difficulty}
                onChange={(e) => setEditForm({ ...editForm, difficulty: parseInt(e.target.value) })}
                className="w-full rounded-lg bg-surface-2/40 border border-white/5 backdrop-blur-sm text-text-primary py-2 px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              >
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Challenging</option>
              </select>
            </div>
            <Input
              label="XP Reward"
              type="number"
              value={editForm.xp_reward}
              onChange={(e) => setEditForm({ ...editForm, xp_reward: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Video URL"
              value={editForm.video_url}
              onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button variant="secondary" onClick={() => setEditingSign(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageWrapper>
  )
}
