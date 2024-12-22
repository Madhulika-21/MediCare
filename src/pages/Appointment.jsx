import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [relatedDoctors, setRelatedDoctors] = useState([]);

  const fetchDocInfo = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvailableSlots = () => {
    setDocSlots([]);
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      const timeSlots = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  const filterRelatedDoctors = () => {
    if (!docInfo) return;

    const filteredDoctors = doctors.filter(
      (doctor) => doctor.speciality === docInfo.speciality && doctor._id !== docId
    );
    setRelatedDoctors(filteredDoctors);
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
      filterRelatedDoctors();
    }
  }, [docInfo]);

  const handleDoctorClick = (id) => {
    navigate(`/appointment/${id}`);
  };

  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img className="bg-primary w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:
              <span className="text-gray-600">
                {currencySymbol} {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 mb-6">
            {docSlots.length > 0 &&
              docSlots.map((item, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center text-center py-3 px-4 rounded-full cursor-pointer ${
                    slotIndex === index ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600'
                  }`}
                  onClick={() => setSlotIndex(index)}
                >
                  <p className="text-sm font-medium">
                    {item[0] && `${daysOfWeek[item[0].datetime.getDay()]}`}
                  </p>
                  <p className="text-xs">
                    {item[0]?.datetime.getDate()}
                  </p>
                </div>
              ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {docSlots[slotIndex] &&
              docSlots[slotIndex].map((slot, i) => (
                <button
                  key={i}
                  className={`py-2 px-4 rounded-full text-sm font-medium ${
                    slotTime === slot.time
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-600'
                  }`}
                  onClick={() => setSlotTime(slot.time)}
                >
                  {slot.time}
                </button>
              ))}
          </div>

          <div className="mt-8">
            <button className="py-3 px-8 bg-blue-600 text-white rounded-full font-medium text-lg">
              Book an appointment
            </button>
          </div>
        </div>

        {/* Related Doctors */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Related Doctors</h2>
          <p className="text-gray-600 text-center mb-8">
            Browse through other {docInfo.speciality} doctors.
          </p>
          <div className="flex justify-center gap-6">
            {relatedDoctors.map((relatedDoctor) => (
              <div
                key={relatedDoctor._id}
                className="border border-gray-200 rounded-lg p-4 w-60 cursor-pointer hover:shadow-md"
                onClick={() => handleDoctorClick(relatedDoctor._id)}
              >
                <img
                  src={relatedDoctor.image}
                  alt={relatedDoctor.name}
                  className="rounded-lg mb-4 w-full h-40 object-cover"
                />
                <p className="text-sm font-medium text-green-600 mb-1">Available</p>
                <p className="text-lg font-semibold text-gray-800">{relatedDoctor.name}</p>
                <p className="text-gray-600 text-sm">{relatedDoctor.speciality}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Appointment;
