import smartVisionGlassesThumb from "../../assets/images/thumb_smart_vision_glasses_1795262008680.jpg";
import hearingAidEmergencyThumb from "../../assets/images/thumb_hearing_aid_emergency_1795261998240.jpg";
import inclusiveErCommunicationThumb from "../../assets/images/thumb_inclusive_er_communication_1795261999876.jpg";
import organDonationFactsThumb from "../../assets/images/thumb_organ_donation_facts_1795262001150.jpg";
import cprFirstAidGuideThumb from "../../assets/images/thumb_cpr_first_aid_guide_1795262002101.jpg";
import { AWARENESS_THUMBNAILS } from "../../lib/awarenessVideoCatalog";

export interface AwarenessThumbnailOption {
  id: string;
  label: string;
  catalogPath: string;
  resolvedSrc: string;
}

const THUMB_MAP: Record<string, string> = {
  [AWARENESS_THUMBNAILS.smartVisionGlasses]: smartVisionGlassesThumb,
  [AWARENESS_THUMBNAILS.hearingAidEmergency]: hearingAidEmergencyThumb,
  [AWARENESS_THUMBNAILS.inclusiveErCommunication]: inclusiveErCommunicationThumb,
  [AWARENESS_THUMBNAILS.organDonationFacts]: organDonationFactsThumb,
  [AWARENESS_THUMBNAILS.cprFirstAidGuide]: cprFirstAidGuideThumb,
};

export const AWARENESS_THUMBNAIL_OPTIONS: AwarenessThumbnailOption[] = [
  {
    id: "smartVisionGlasses",
    label: "AI Smart Vision Glasses",
    catalogPath: AWARENESS_THUMBNAILS.smartVisionGlasses,
    resolvedSrc: smartVisionGlassesThumb,
  },
  {
    id: "hearingAidEmergency",
    label: "Hearing Aid & Audiology Care",
    catalogPath: AWARENESS_THUMBNAILS.hearingAidEmergency,
    resolvedSrc: hearingAidEmergencyThumb,
  },
  {
    id: "inclusiveErCommunication",
    label: "Inclusive ER Communication",
    catalogPath: AWARENESS_THUMBNAILS.inclusiveErCommunication,
    resolvedSrc: inclusiveErCommunicationThumb,
  },
  {
    id: "organDonationFacts",
    label: "Organ & Tissue Donation",
    catalogPath: AWARENESS_THUMBNAILS.organDonationFacts,
    resolvedSrc: organDonationFactsThumb,
  },
  {
    id: "cprFirstAidGuide",
    label: "Emergency First Aid & Guiding",
    catalogPath: AWARENESS_THUMBNAILS.cprFirstAidGuide,
    resolvedSrc: cprFirstAidGuideThumb,
  },
];

export function resolveAwarenessThumbnail(thumbnailUrl: string): string {
  if (THUMB_MAP[thumbnailUrl]) {
    return THUMB_MAP[thumbnailUrl];
  }
  return thumbnailUrl || smartVisionGlassesThumb;
}
