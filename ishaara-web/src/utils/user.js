export function getDisplayName(user) {
  return user?.displayName
      || user?.display_name
      || user?.profile?.display_name
      || user?.username
      || 'User'
}
