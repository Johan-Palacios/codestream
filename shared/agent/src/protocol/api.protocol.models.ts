"use strict";

import { ThirdPartyProviders } from "./agent.protocol";

export interface CSEntity {
	deactivated?: boolean;
	createdAt: number;
	modifiedAt: number;
	id: string;
	creatorId: string;
	version?: number;
}

export enum ProviderType {
	MSTeams = "msteams",
	Slack = "slack"
}

export enum CodemarkType {
	Comment = "comment",
	Issue = "issue",
	Bookmark = "bookmark",
	Question = "question",
	Trap = "trap",
	Link = "link"
}

export enum CodemarkStatus {
	Open = "open",
	Closed = "closed"
}

export interface CSCodemark extends CSEntity {
	teamId: string;
	streamId: string;
	postId: string;
	parentPostId?: string;
	markerIds?: string[];
	fileStreamIds: string[];
	providerType?: ProviderType;
	type: CodemarkType;
	color: "blue" | "green" | "yellow" | "orange" | "red" | "purple" | "aqua" | "gray" | string;
	status: CodemarkStatus;
	title: string;
	assignees: string[];
	text: string;
	numReplies: number;
	pinned: boolean;
	pinnedReplies?: string[];

	externalAssignees?: { displayName: string; email?: string }[];
	externalProvider?: string;
	externalProviderHost?: string;
	externalProviderUrl?: string;
}

export interface CSMarkerIdentifier {
	id: string;
	file: string;
	repoId: string;
}

export interface CSMarker extends CSEntity, CSMarkerIdentifier {
	teamId: string;
	fileStreamId: string;
	postStreamId: string;
	postId: string;
	codemarkId: string;
	providerType?: ProviderType;
	commitHashWhenCreated: string;
	locationWhenCreated: CSLocationArray;
	code: string;
	repo: string;
}

export interface CSLocationMeta {
	startWasDeleted?: boolean;
	endWasDeleted?: boolean;
	entirelyDeleted?: boolean;
	contentChanged?: boolean;
}

export type CSLocationArray = [number, number, number, number, CSLocationMeta | undefined];

export interface CSMarkerLocations {
	teamId: string;
	streamId: string;
	commitHash: string;
	locations: { [id: string]: CSLocationArray };
}

export interface CSMarkerLocation {
	id: string;
	lineStart: number;
	colStart: number;
	lineEnd: number;
	colEnd: number;
	meta?: CSLocationMeta;
}

export interface CSCodeBlock {
	code: string;
	markerId: string;
	file: string;
	repoId: string;
	streamId?: string;
}

export interface CSPost extends CSEntity {
	teamId: string;
	streamId: string;
	parentPostId?: string;
	numReplies: number;
	text: string;
	seqNum: number | string;
	hasBeenEdited: boolean;
	mentionedUserIds?: string[];
	origin?: "email" | "slack" | "msteams";
	reactions?: { [key: string]: string[] };
	codemarkId?: string;
	files?: [
		{
			mimetype: string;
			name: string;
			title: string;
			type: string;
			url: string;
			preview?:
				| string
				| {
						url: string;
						width: number;
						height: number;
				  };
		}
	];
}

export interface CSRemote {
	url: string;
	normalizedUrl: string;
	companyIdentifier: string;
}

export interface CSRepository extends CSEntity {
	name: string;
	remotes: CSRemote[];
	teamId: string;
}

export enum StreamType {
	Channel = "channel",
	Direct = "direct",
	File = "file"
}

export enum ChannelServiceType {
	Vsls = "vsls"
}

export interface CSChannelStream extends CSEntity {
	isArchived: boolean;
	privacy: "public" | "private";
	sortId: string;
	teamId: string;
	mostRecentPostCreatedAt?: number;
	mostRecentPostId?: string;
	purpose?: string;

	type: StreamType.Channel;
	name: string;
	memberIds?: string[];
	isTeamStream: boolean;
	serviceType?: ChannelServiceType.Vsls;
	serviceKey?: string;
	serviceInfo?: { [key: string]: any };

	priority?: number;
}

export interface CSDirectStream extends CSEntity {
	isArchived: boolean;
	isClosed?: boolean;
	privacy: "public" | "private";
	sortId: string;
	teamId: string;
	mostRecentPostCreatedAt?: number;
	mostRecentPostId?: string;
	purpose?: string;

	type: StreamType.Direct;
	name?: string;
	memberIds: string[];

	priority?: number;
}

export interface CSFileStream extends CSEntity {
	isArchived: boolean;
	privacy: "public" | "private";
	sortId: string;
	teamId: string;
	mostRecentPostCreatedAt?: number;
	mostRecentPostId?: string;
	purpose?: string;

	type: StreamType.File;
	file: string;
	repoId: string;
	numMarkers: number;
	editingUsers?: any;
}

export type CSStream = CSChannelStream | CSDirectStream | CSFileStream;

export interface CSTeamMSTeamsProviderInfo {
	teamId: string;
}

export interface CSTeamSlackProviderInfo {
	teamId: string;
}

export interface CSCompany extends CSEntity {
	name: string;
}

export interface CSTeam extends CSEntity {
	companyId: string;
	memberIds: string[];
	name: string;
	primaryReferral: "internal" | "external";
	integrations?: { [key: string]: { enabled: boolean } };
	providerInfo?: {
		msteams?: CSTeamMSTeamsProviderInfo;
		slack?: CSTeamSlackProviderInfo;
	};
	providerHosts?: ThirdPartyProviders;
	plan?: string;
	trialStartDate?: number;
	trialEndDate?: number;
}

export interface CSAsanaProviderInfo {
	refreshToken: string;
	accessToken: string;
	expiresAt: number;
	userId: string;
	hosts: { [host: string]: CSAsanaProviderInfo };
}

export interface CSBitbucketProviderInfo {
	refreshToken: string;
	accessToken: string;
	expiresAt: number;
	userId: string;
	hosts: { [host: string]: CSBitbucketProviderInfo };
}

export interface CSGitHubProviderInfo {
	accessToken: string;
	userId: string;
	hosts: { [host: string]: CSGitHubProviderInfo };
}

export interface CSGitLabProviderInfo {
	accessToken: string;
	userId: string;
	hosts: { [host: string]: CSGitLabProviderInfo };
}

export interface CSJiraProviderInfo {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	hosts: { [hosts: string]: CSJiraProviderInfo };
}

export interface CSMSTeamsProviderInfo {
	accessToken: string;
	data: {
		expires_in: number;
		scope: string;
		token_type: string;
	};
	expiresAt: number;
	refreshToken: string;

	teamId: string;
	userId: string;
	hosts?: { [host: string]: CSMSTeamsProviderInfo };
}

export interface CSSlackProviderInfo {
	accessToken: string;
	teamId: string;
	userId: string;
	hosts?: { [host: string]: CSSlackProviderInfo };
}

export interface CSTrelloProviderInfo {
	accessToken: string;
	apiKey: string;
	userId: string;
	hosts: { [host: string]: CSTrelloProviderInfo };
}

export interface CSYouTrackProviderInfo {
	accessToken: string;
	userId: string;
	hosts: { [host: string]: CSYouTrackProviderInfo };
	data?: {
		baseUrl?: string;
	};
}

export interface CSAzureDevOpsProviderInfo {
	accessToken: string;
	organization?: string;
	hosts: { [host: string]: CSAzureDevOpsProviderInfo };
}

export type CSProviderInfos =
	| CSAsanaProviderInfo
	| CSBitbucketProviderInfo
	| CSGitHubProviderInfo
	| CSGitLabProviderInfo
	| CSJiraProviderInfo
	| CSMSTeamsProviderInfo
	| CSSlackProviderInfo
	| CSTrelloProviderInfo
	| CSYouTrackProviderInfo
	| CSAzureDevOpsProviderInfo;

type Filter<T, U> = T extends U ? T : never;
export type CSRefreshableProviderInfos = Filter<CSProviderInfos, { refreshToken: string }>;

export interface CSUser extends CSEntity {
	companyIds: string[];
	email: string;
	firstName: string;
	fullName: string;
	isRegistered: boolean;
	iWorkOn?: string;
	lastName: string;
	lastPostCreatedAt: number;
	numMentions: number;
	numInvites: number;
	registeredAt: number;
	secondaryEmails?: string[];
	teamIds: string[];
	timeZone: string;
	totalPosts: number;
	username: string;
	providerIdentities?: string[];
	codestreamId?: string;

	avatar?: {
		image?: string;
		image48?: string;
	};
	dnd?: boolean;
	presence?: string;
	preferences?: CSMePreferences;
	firstSessionStartedAt?: number;
}

export interface CSLastReads {
	[streamId: string]: number | string;
}

export interface CSMePreferences {
	telemetryConsent?: boolean; // legacy
	telemetryOptOut?: boolean;
	[key: string]: any;
}

type CSMeProviderInfo = { slack?: CSSlackProviderInfo } & {
	[teamId in string]: {
		asana?: CSAsanaProviderInfo;
		github?: CSGitHubProviderInfo;
		jira?: CSJiraProviderInfo;
		msteams?: CSMSTeamsProviderInfo;
		slack?: CSSlackProviderInfo;
		trello?: CSTrelloProviderInfo;
		youtrack?: CSYouTrackProviderInfo;
		azuredevops?: CSAzureDevOpsProviderInfo;
		[key: string]: CSProviderInfos | undefined;
	}
};

export interface CSMe extends CSUser {
	lastReads: CSLastReads;
	joinMethod: string;
	preferences?: CSMePreferences;
	providerInfo?: CSMeProviderInfo;
}
