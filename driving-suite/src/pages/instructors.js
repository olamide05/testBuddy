import React from 'react';
import { Star, MapPin, ShieldCheck, Search as SearchIcon, UserPlus } from "lucide-react";

const instructors = [
  {
    id: 1,
    name: "John Kavanagh",
    imageUrl: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&q=80",
    rating: 4.9,
    reviews: 125,
    bio: "With over 15 years of experience, John is a patient and certified instructor specializing in nervous beginners. He covers all of South Dublin.",
    areas: ["South Dublin", "City Centre"],
    qualifications: ["Garda Vetted"],
  },
  {
    id: 2,
    name: "Aoife Murphy",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    rating: 5.0,
    reviews: 98,
    bio: "Aoife is known for her friendly approach and high pass rate. She offers lessons in both manual and automatic cars across North Dublin.",
    areas: ["North Dublin", "Malahide", "Swords"],
    qualifications: ["Garda Vetted"],
  },
  {
    id: 3,
    name: "Ciara O'Brien",
    imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=200&q=80",
    rating: 4.8,
    reviews: 210,
    bio: "Specializing in pre-test preparation and mock tests, Ciara has a knack for getting learners test-ready in record time. Based in Cork.",
    areas: ["Cork City", "Ballincollig"],
    qualifications: ["Garda Vetted"],
  },
];

export default function InstructorsPage() {
  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Find Your Instructor</h1>
          <p className="mt-2 text-gray-600">
            Search for the perfect instructor to guide you on your driving journey.
          </p>
        </div>
        <a
          href="/instructors/register"
          className="inline-flex items-center px-4 py-2 rounded-md border"
        >
          <UserPlus className="mr-2 w-5 h-5" />
          Become an Instructor
        </a>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or area..."
          className="w-full border rounded-md pl-10 pr-4 py-2 focus:outline-none"
        />
      </div>

      {/* Instructor Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className="border rounded-lg p-6 flex flex-col justify-between shadow-sm"
          >
            <div className="flex items-start gap-4">
              <img
                src={instructor.imageUrl}
                alt={instructor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{instructor.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  <span>{instructor.rating}</span>
                  <span>({instructor.reviews} reviews)</span>
                </div>
                {instructor.qualifications.includes("Garda Vetted") && (
                  <div className="flex items-center mt-1 text-xs border rounded-full px-2 py-1 w-fit">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Garda Vetted
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm mt-4 mb-6">{instructor.bio}</p>

            <div className="flex items-center gap-2 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{instructor.areas.join(", ")}</span>
            </div>

            <a
              href={`/instructors/${instructor.id}`}
              className="text-center border rounded-md py-2 font-medium"
            >
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

