"use client";

import Image from "next/image";

export interface TeamSectionProps {
  language: "en" | "ceb";
}

// Team members data
const teamMembers = [
  { name: "Divina Alburo", role: { en: "Chief Executive Officer", ceb: "Punong Ehekutibo" }, img: "/idPics/idDivine.png" },
  { name: "Ronelyn Pelayo", role: { en: "Office Manager", ceb: "Tagdumala sa Pahulam" }, img: "/idPics/idRonelyn.png" },
  { name: "Aiza Valiente", role: { en: "Loan Officer", ceb: "Opisyal sa Pahulam" }, img: "/idPics/idAiza.png" },
  { name: "Rosielle Marie Navares", role: { en: "Loan Officer", ceb: "Opisyal sa Pahulam" }, img: "/idPics/idRosielle.png" },
  { name: "Chris Damayo", role: { en: "Accountant", ceb: "Tigpamaba" }, img: "/idPics/idChris.png" },
  { name: "Voltair Bracero", role: { en: "Field Lead", ceb: "Pangulo sa Field" }, img: "/idPics/idVoltair.png" },
  { name: "Rodelo Lepiten", role: { en: "Head Collector", ceb: "Pangulo sa Kolektor" }, img: "/idPics/idRodelo.png" },
  { name: "Shiela May Lepon", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idShiela.png" },
  { name: "Morgan Thomas", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idMorgan.png" },
  { name: "Ryan Martinez", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idRyan.png" },
  { name: "Olivia Hernandez", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idOlivia.png" },
  { name: "Kevin Lee", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idKevin.png" },
  { name: "Amy Gonzalez", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idAmy.png" },
  { name: "Jason Scott", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idJason.png" },
  { name: "Emma Lopez", role: { en: "Collector", ceb: "Kolektor" }, img: "/idPics/idEmma.png" },
];

const TeamSection: React.FC<TeamSectionProps> = ({ language }) => {
  const ceo = teamMembers.find(member => member.role.en === "Chief Executive Officer");
  const others = teamMembers.filter(member => member.role.en !== "Chief Executive Officer");
  
  // Separate the last two members (Jason Scott and Emma Lopez)
  const regularMembers = others.slice(0, -2);
  const lastTwoMembers = others.slice(-2);

  return (
    <section className="py-24 bg-gray-50 text-black" id="team">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          {language === "en" ? "Meet Our Team" : "Ilaila ang Among Team"}
        </h2>

        {/* CEO on top (highlighted) */}
        {ceo && (
          <div className="flex flex-col items-center mb-20 text-center">
            <div className="bg-white rounded-full shadow-lg p-2 w-44 h-44 relative">
              <Image
                src={ceo.img}
                alt={ceo.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mt-6">{ceo.name}</h3>
            <p className="text-lg text-gray-500">{ceo.role[language]}</p>
          </div>
        )}

        {/* Grid for the regular members */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {regularMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role[language]}</p>
            </div>
          ))}
        </div>

        {/* Centered grid for the last two members */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-10">
          {/* Empty placeholder for first column */}
          <div></div>
          {/* Jason Scott and Emma Lopez in the middle */}
          {lastTwoMembers.map((member, index) => (
            <div
              key={`last-${index}`}
              className="bg-white rounded-xl shadow-md p-6 text-center transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative w-24 h-24 mx-auto mb-4">
                <Image
                  src={member.img}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role[language]}</p>
            </div>
          ))}
          {/* Empty placeholder for last column */}
          <div></div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
