import React from 'react';
import { GroundingMetadata, GroundingChunk } from '../types';
import { MapPin, Globe, ExternalLink, Star } from 'lucide-react';

interface GroundingSourcesProps {
  metadata: GroundingMetadata;
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ metadata }) => {
  if (!metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  const mapChunks = metadata.groundingChunks.filter((chunk: GroundingChunk) => chunk.maps);
  const webChunks = metadata.groundingChunks.filter((chunk: GroundingChunk) => chunk.web);

  return (
    <div className="mt-3 space-y-3">
      {/* Maps Sources */}
      {mapChunks.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin size={12} />
            Map Locations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mapChunks.map((chunk, idx) => {
              const mapData = chunk.maps!;
              return (
                <a
                  key={`map-${idx}`}
                  href={mapData.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-medium text-sm text-slate-800 group-hover:text-blue-600 line-clamp-1">
                      {mapData.title}
                    </h5>
                    <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {/* Display review snippet if available */}
                  {mapData.placeAnswerSources?.reviewSnippets?.[0] && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded italic border-l-2 border-blue-300">
                      "{mapData.placeAnswerSources.reviewSnippets[0].content}"
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Web Sources */}
      {webChunks.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Globe size={12} />
            Web Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {webChunks.map((chunk, idx) => {
              const webData = chunk.web!;
              return (
                <a
                  key={`web-${idx}`}
                  href={webData.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs transition-colors"
                >
                  <span className="truncate max-w-[150px]">{webData.title}</span>
                  <ExternalLink size={10} />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundingSources;
