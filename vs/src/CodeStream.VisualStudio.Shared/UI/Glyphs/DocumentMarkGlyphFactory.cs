﻿using System.Windows;
using CodeStream.VisualStudio.Shared.Models;
using CodeStream.VisualStudio.Shared.UI.Margins;
using Microsoft.VisualStudio.Text.Editor;
using Microsoft.VisualStudio.Text.Formatting;

namespace CodeStream.VisualStudio.Shared.UI.Glyphs {
	internal class DocumentMarkGlyphFactory : IGlyphFactory {
		/// <summary>
		/// Creates a WPF Codemark
		/// </summary>
		/// <param name="line"></param>
		/// <param name="tag"></param>
		/// <returns></returns>
		public UIElement GenerateGlyph(IWpfTextViewLine line, IGlyphTag tag) {
			if (tag == null) return null;

			// Ensure we can draw a glyph for this marker.
			var documentMarkGlyphTag = tag as DocumentMarkGlyphTag;
			 
			if (documentMarkGlyphTag?.DocumentMarker?.Codemark != null ||
				documentMarkGlyphTag?.DocumentMarker?.Type == CodemarkType.Prcomment) {

				return new DocumentMark(new DocumentMarkViewModel(documentMarkGlyphTag.DocumentMarker));
			}

			return null;
		}
	}
}
