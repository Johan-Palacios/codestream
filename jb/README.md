<p align="center">
  <br />
  <a title="Learn more about CodeStream" href="https://codestream.com?utm_source=jbmarket&utm_medium=banner&utm_campaign=codestream"><img src="https://alt-images.codestream.com/codestream_logo_jbmarketplace.png" alt="CodeStream Logo" /></a>
</p>

# CodeStream

CodeStream helps dev teams discuss, review, and understand code. Discussing code is now as simple as commenting on a Google Doc — select the code and type your question.

![CodeStream](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CSforJB.png)

CodeStream turns conversation into documentation by capturing all of the discussion about your code, and saving it with your code. Each discussion is represented as a "codemark" that is permanently connected to the lines of code to which it refers.

## Does your team use Slack?

Sign up for CodeStream using Slack so that discussions about code can be shared in your existing Slack channels and direct messages. Connecting to your Slack workspace allows developers to participate in discussions about code when they're not in their editor, or if they don’t use an editor supported by CodeStream.

# Requirements

- CodeStream requires version 2018.3 or later of any JetBrains IDE.
- Your repository must be managed by Git, or a Git hosting service like GitHub.
- In order to sign up with Slack, make sure your company doesn't require Slack apps to be pre-approved by an admin. CodeStream is not yet available in the Slack app directory.

# Things to Try

## Create a codemark and discuss some code

Create a codemark by selecting a block of code in your editor and then typing a question or comment. Keep in mind that, unlike with other solutions, you can discuss any line of code in any source file at any time, even if it’s code that you just typed into your editor and haven’t yet saved or committed.

![New Codemark](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/NewCodemark2.png)

In addition to general comments and questions, there are specific types of codemarks for assigning issues, saving bookmarks, or generating a permalink to a specific block of code.

![Issue Codemark](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CodemarkIssue2.png)

CodeStream integrates with Jira, Trello, GitHub, Asana, Bitbucket, and GitLab, making it easy to create an issue tied to a specific block of code, and have that issue appear in your existing issue-tracking service.

## Add comments to ongoing discussions

Click on a codemark to participate in the discussion. If you have the repo open, you’ll automatically be taken to the appropriate source file and scrolled to the code block.

![Thread View](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/ThreadView2.png)

## Leverage your team's knowledge base

A codemark displayed to the right of a block of code means that a discussion took place about that code. Click on the codemark to view the discussion and get some context for the work at hand.

![Codemark in Source File](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/SpatialSingleMarker.png)

Click on the Search icon to explore your team’s entire knowledge base. Filters allow you to look at codemarks of a certain type, or a specific color.

![Codemarks tab](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CodemarksTab1.png)

# Frequently Asked Questions

#### Where are messages stored?

Your team’s message history is stored in the cloud on CodeStream’s servers. If your team is connected to Slack, however, CodeStream doesn't store your messages at all. The one exception is with codemarks, where the content and code block are stored by CodeStream as part of maintaining your knowledge base.

#### Does it work across branches?

CodeStream recognizes that developers on your team may be working on different branches, or may simply have local changes that result in certain blocks of code being in different locations for each of them. If there are messages associated with those blocks of code, CodeStream ensures that each developer sees the discussion markers in the correct location despite the variations in each of their local buffers.

#### What access to Git does CodeStream require?

You won’t need to provide CodeStream with any Git (or GitHub, Bitbucket, etc.) credentials, as the plugin simply leverages your IDE’s access to Git. CodeStream uses Git to do things like automatically mention the most recent author when you share a block of code in a post, and to maintain the connection between that block of code and where it’s located in the source file as the file evolves over time (and commits).

# Help & Feedback

Check out our [wiki](https://github.com/TeamCodeStream/CodeStream/wiki) for more information on getting started with CodeStream. Please follow [@teamcodestream](http://twitter.com/teamcodestream) for product updates and to share feedback and questions. You can also email us at codestream@newrelic.com.
