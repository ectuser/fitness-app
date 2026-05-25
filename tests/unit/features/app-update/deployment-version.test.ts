import { describe, expect, it } from 'vitest'
import { formatDeploymentVersion } from '@/features/app-update/deployment-version'

describe('formatDeploymentVersion', () => {
  it('renders runNumber and shortSha as runNumber-shortSha', () => {
    expect(formatDeploymentVersion('42', 'a1b2c3d')).toBe('42-a1b2c3d')
  })

  it('truncates a full commit sha to seven characters', () => {
    expect(
      formatDeploymentVersion(
        '42',
        'a1b2c3d4e5f6789012345678901234567890abcd',
      ),
    ).toBe('42-a1b2c3d')
  })

  it('falls back to local when run number is missing', () => {
    expect(formatDeploymentVersion(undefined, 'a1b2c3d')).toBe('local')
    expect(formatDeploymentVersion('', 'a1b2c3d')).toBe('local')
    expect(formatDeploymentVersion('   ', 'a1b2c3d')).toBe('local')
  })

  it('falls back to local when short sha is missing', () => {
    expect(formatDeploymentVersion('42', undefined)).toBe('local')
    expect(formatDeploymentVersion('42', '')).toBe('local')
    expect(formatDeploymentVersion('42', '   ')).toBe('local')
  })

  it('falls back to local when both values are missing', () => {
    expect(formatDeploymentVersion(undefined, undefined)).toBe('local')
  })
})
