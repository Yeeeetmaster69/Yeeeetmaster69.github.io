# GitHub Actions Workflow Permissions Fix

## Issue Fixed
The `build-release.yml` workflow was failing with a 403 error when trying to create GitHub releases:

```
⚠️ GitHub release failed with status: 403
{"message":"Resource not accessible by integration","documentation_url":"https://docs.github.com/rest/releases/releases#create-a-release","status":"403"}
Skip retry — your GitHub token/PAT does not have the required permission to create a release
```

## Root Cause
The `softprops/action-gh-release@v2` action requires `contents: write` permission to create GitHub releases, but the workflow was using default permissions which only allow read access.

## Solution
Added the required permissions to the workflow file:

```yaml
permissions:
  contents: write
```

## Files Modified
- `.github/workflows/build-release.yml` - Added permissions section

## Result
The workflow can now successfully create GitHub releases and attach APK files as release assets.

## Related Workflows
- `build-apk.yml` - Uses artifacts instead of releases (no special permissions needed)
- `build-release.yml` - Creates GitHub releases (requires contents: write permission)

## GitHub Actions Permissions Reference
For more information about GitHub Actions permissions, see:
- [GitHub Actions Permissions Documentation](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
- [softprops/action-gh-release Documentation](https://github.com/softprops/action-gh-release)