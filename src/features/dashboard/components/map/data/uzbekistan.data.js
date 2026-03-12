import NavoiMap from "../NavoiMap";
import AndijanMap from "../AndijanMap";
import BukharaMap from "../BukharaMap";
import FerganaMap from "../FerganaMap";
import JizzakhMap from "../JizzakhMap";
import KhorezmMap from "../KhorezmMap";
import SyrdaryaMap from "../SyrdaryaMap";
import NamanganMap from "../NamanganMap";
import TashkentMap from "../TashkentMap";
import KashkadaryaMap from "../KashkadaryaMap";
import TashkentCityMap from "../TashkentCityMap";
import SurkhandaryaMap from "../SurkhandaryaMap";
import KarakalpakstanMap from "../KarakalpakstanMap";

/** @type {{ label: string }[]} */
const uzbekistanRegions = [
  { component: AndijanMap, label: "Andijon viloyati" },
  { component: BukharaMap, label: "Buxoro viloyati" },
  { component: FerganaMap, label: "Farg'ona viloyati" },
  { component: JizzakhMap, label: "Jizzax viloyati" },
  { component: NamanganMap, label: "Namangan viloyati" },
  { component: NavoiMap, label: "Navoiy viloyati" },
  { component: KashkadaryaMap, label: "Qashqadaryo viloyati" },
  { component: KarakalpakstanMap, label: "Qoraqalpog'iston Respublikasi" },
  { component: AndijanMap, label: "Samarqand viloyati" },
  { component: SyrdaryaMap, label: "Sirdaryo viloyati" },
  { component: SurkhandaryaMap, label: "Surxondaryo viloyati" },
  { component: TashkentCityMap, label: "Toshkent Shahri" },
  { component: TashkentMap, label: "Toshkent viloyati" },
  { component: KhorezmMap, label: "Xorazm viloyati" },
];

export const getRegionByLabel = (label) => {
  const finded = uzbekistanRegions.find(
    (region) =>
      region.label.trim().toLowerCase() === label?.trim().toLowerCase(),
  );
  return finded || uzbekistanRegions[0];
};

export default uzbekistanRegions;
