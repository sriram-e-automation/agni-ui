# Changesets

One file per change, written at the moment you make it — not at release time.

    npx changeset

Pick the bump level (see the table in ../CONTRIBUTING.md), then write the
summary **for the person consuming the change**: name the component, say what
moved, say what they have to do. A line that says "refactor" tells nobody
anything.

A major bump must carry an explicit migration line:

    Migration: pass `actions={<Button iconOnly icon={…} />}` to keep the ⋮ button.

These files are consumed and deleted by `changeset version`, which folds them
into CHANGELOG.md. Nothing here should survive a release.
