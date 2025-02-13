﻿using Microsoft.VisualStudio.Shell;

using System;

using CodeStream.VisualStudio.Shared.Models;
using CodeStream.VisualStudio.Shared.Services;

#if X86
	using CodeStream.VisualStudio.Vsix.x86;
#else
	using CodeStream.VisualStudio.Vsix.x64;
#endif

namespace CodeStream.VisualStudio.Shared.Commands {
	internal class AddCodemarkCommentCommand : AddCodemarkCommandBase {
		public AddCodemarkCommentCommand(
			ISessionService sessionService, 
			IIdeService ideService,
			Guid commandSet) : base(sessionService, ideService, commandSet, PackageIds.AddCodemarkCommentCommandId) { }
		protected override CodemarkType CodemarkType => CodemarkType.Comment;
	}

	internal class AddCodemarkIssueCommand : AddCodemarkCommandBase {
		public AddCodemarkIssueCommand(
			ISessionService sessionService, 
			IIdeService ideService,
			Guid commandSet
			) : base(sessionService, ideService, commandSet, PackageIds.AddCodemarkIssueCommandId) { }
		protected override CodemarkType CodemarkType => CodemarkType.Issue;

		protected override void OnBeforeQueryStatus(OleMenuCommand sender, EventArgs e) {
			base.OnBeforeQueryStatus(sender, e);

			sender.Visible = IdeService.GetActiveDiffEditor() == null && sender.Visible;
		}
	}

	internal class AddCodemarkPermalinkCommand : AddCodemarkCommandBase {
		public AddCodemarkPermalinkCommand(
			ISessionService sessionService,
			IIdeService ideService, 
			Guid commandSet) : base(sessionService, ideService, commandSet, PackageIds.AddCodemarkPermalinkCommandId) { }
		protected override CodemarkType CodemarkType => CodemarkType.Link;

		protected override void OnBeforeQueryStatus(OleMenuCommand sender, EventArgs e) {
			base.OnBeforeQueryStatus(sender, e);

			sender.Visible = IdeService.GetActiveDiffEditor() == null && sender.Visible;
		}
	}
}
