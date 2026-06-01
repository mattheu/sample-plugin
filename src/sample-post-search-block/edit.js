import {
	useBlockProps,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';

import { useSelect } from '@wordpress/data';

import { __ } from '@wordpress/i18n';
import { Button, PanelBody, ToolbarGroup } from '@wordpress/components';
import { useState } from '@wordpress/element';

import {
	PostPickerModal,
	PostPickerToolbarButton,
} from './components/PostPicker';

export default function Edit( { attributes, setAttributes } ) {
	const { postIds } = attributes;
	const [ modalOpen, setModalOpen ] = useState( false );

	const posts = useSelect(
		( select ) => {
			if ( ! postIds.length ) {
				return [];
			}

			return postIds
				.map( ( id ) =>
					select( 'core' ).getEntityRecord( 'postType', 'post', id )
				)
				.filter( Boolean );
		},
		[ postIds ]
	);

	const pickerProps = {
		title: __( 'Select Post', 'sample-plugin' ),
		taxonomies: [ 'category', 'post_tag' ],
		maxItems: 1,
		values: postIds,
		onChange: ( ids ) => setAttributes( { postIds: ids } ),
	};

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<PostPickerToolbarButton { ...pickerProps } />
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Read More Links', 'sample-plugin' ) }>
					{ posts.length > 0 && (
						<ul
							style={ {
								margin: '0 0 12px',
								padding: 0,
								listStyle: 'none',
							} }
						>
							{ posts.map( ( post ) => (
								<li
									key={ post.id }
									style={ {
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									} }
								>
									<span>{ post.title?.rendered }</span>
									<Button
										icon="no-alt"
										label={ __(
											'Remove',
											'sample-plugin'
										) }
										isSmall
										onClick={ () =>
											setAttributes( {
												postIds: postIds.filter(
													( id ) => id !== post.id
												),
											} )
										}
									/>
								</li>
							) ) }
						</ul>
					) }
					<Button
						variant="secondary"
						onClick={ () => setModalOpen( true ) }
					>
						{ __( 'Select Post', 'sample-plugin' ) }
					</Button>
					{ modalOpen && (
						<PostPickerModal
							{ ...pickerProps }
							setModalOpen={ setModalOpen }
						/>
					) }
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps( { className: 'dmg-read-more' } ) }>
				{ posts.length > 0 ? (
					posts.map( ( post ) => (
						<p key={ post.id }>
							<a
								href={ post.link }
								onClick={ ( e ) => e.preventDefault() }
							>
								{ `Read More: ${ post.title?.rendered ?? '' }` }
							</a>
						</p>
					) )
				) : (
					<p>
						{ __(
							'Select a post in the block settings.',
							'sample-plugin'
						) }
					</p>
				) }
			</div>
		</>
	);
}
