import { Volume2, VolumeX } from "lucide-react";
import { useZenAudio } from "./ZenAudioEngine";

export function ZenAudioToggle() {
  const { muted, toggle } = useZenAudio();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-mono transition-colors duration-200 cursor-pointer ${
        muted
          ? "border-[#343934] bg-[#1B1D1B] text-[#929690] hover:border-[#414741] hover:text-[#F2F3F0]"
          : "border-[#A3B899] bg-[#252825] text-[#A3B899]"
      }`}
      aria-label={muted ? "Unmute soundscape" : "Mute soundscape"}
      title={muted ? "Enable ambient soundscape" : "Mute soundscape"}
    >
      {muted ? (
        <>
          <VolumeX className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ambience [Off]</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 text-[#A3B899]" />
          <span className="hidden sm:inline">Soundscape [On]</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#A3B899]" />
        </>
      )}
    </button>
  );
}
