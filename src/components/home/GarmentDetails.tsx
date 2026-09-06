import { hasPublicAsset } from '@/lib/assets';
import { assetManifest } from '@/lib/assetManifest';
import ConstructionReveal from './ConstructionReveal';

// The approved Construction Turntable now renders identically in both
// PRELAUNCH_MODE states — page.tsx mounts GarmentDetails in both branches,
// and this component no longer branches on PRELAUNCH_MODE itself. The
// older, simpler prelaunch-only fact-grid variant (pre-Turntable redesign)
// has been removed rather than kept as a second, unused code path — there
// is now exactly one Construction section, reused as-is.
export default function GarmentDetails() {
  const asset = assetManifest.fabricMacro;
  const ready = hasPublicAsset(asset.desktopPath);
  // Separate readiness check for the Turntable's hero garment cutouts —
  // decoupled from `ready` (which only reflects fabric-macro.jpg) so a
  // missing garment asset can never render a broken image, and vice versa.
  const garmentReady =
    hasPublicAsset('images/lunaro-front-transparent.png') &&
    hasPublicAsset('images/lunaro-back-transparent.png');

  return (
    <ConstructionReveal
      ready={ready}
      garmentReady={garmentReady}
      desktopPath={asset.desktopPath}
      fallbackVariant={asset.fallback}
    />
  );
}
