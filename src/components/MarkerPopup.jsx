import { Popup } from 'react-leaflet';

export default function MarkerPopup({ place, color }) {
  return (
    <Popup className="custom-popup" closeButton={false}>
      <div className="p-1 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-200/20 pb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} 
          />
          <h4 className="font-semibold text-slate-800 m-0">{place.name}</h4>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Nazorat balli:</span>
            <span className="font-bold text-slate-700">{place.score}/100</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Murojaatlar:</span>
            <span className="font-medium text-slate-600">{place.complaints}</span>
          </div>
          <div className="pt-1 mt-1 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-700 line-clamp-1">{place.issue}</span>
          </div>
        </div>
      </div>
    </Popup>
  );
}
