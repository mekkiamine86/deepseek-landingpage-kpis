'use client';

interface SizeColorSelectorProps {
  sizes: string[];
  colors: { name: string; hex?: string }[];
  selectedSize: string | null;
  setSelectedSize: (size: string) => void;
  selectedColor: string | null;
  setSelectedColor: (color: string) => void;
}

export default function SizeColorSelector({
  sizes,
  colors,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
}: SizeColorSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Size Selection */}
      <div>
        <h3 className="text-sm font-medium text-neutral-400 mb-3">اختر المقاس</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 border
                ${
                  selectedSize === size
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'bg-neutral-900 border-neutral-800 text-white hover:border-neutral-600'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-3">اختر اللون</h3>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    selectedColor === color.name
                      ? 'border-orange-600 shadow-lg shadow-orange-600/30'
                      : 'border-neutral-800 hover:border-neutral-600'
                  }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor === color.name && (
                  <span className="text-white text-lg font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}