/**
 * useSdkTester — shared state for the floating SDK Tester bubble.
 * Lives as a Nuxt useState so it persists across page navigations.
 *
 * Usage:
 *   const { bubble } = useSdkTester()
 *   bubble.value.open = true
 *   bubble.value.projectId = 'abc'
 *   bubble.value.token = 'xyz'
 */

export interface SdkTesterBubble {
  /** Is the bubble panel expanded open? */
  open: boolean
  /** Is the bubble visible at all? (can be hidden by user) */
  visible: boolean
  /** Pre-filled config */
  projectId: string
  token: string
  instanceName: string
  /** Live state from SDK */
  sdkState: string | null
  activated: boolean
}

export function useSdkTester() {
  const bubble = useState<SdkTesterBubble>('sdk-tester-bubble', () => ({
    open: false,
    visible: true,
    projectId: '',
    token: '',
    instanceName: '',
    sdkState: null,
    activated: false,
  }))

  function openWith(projectId: string, token: string, name = '') {
    bubble.value.projectId   = projectId
    bubble.value.token       = token
    bubble.value.instanceName = name
    bubble.value.open        = true
    bubble.value.visible     = true
  }

  function toggle() {
    bubble.value.open = !bubble.value.open
  }

  function hide() {
    bubble.value.open    = false
    bubble.value.visible = false
  }

  return { bubble, openWith, toggle, hide }
}