import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

export interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  router.isFallback && (
    <div>Carregando...</div>
  )

  return (
    <>
      <Head>
        <title>Post | {post.data.title}</title>
      </Head>
      <header className={styles.imgHeader}>
        <img src={post.data.banner.url} alt="Image alt" />
      </header>
      <main className={styles.container}>
        <section>
          <h2 className={styles.title}>{post.data.title}</h2>
          <div className={styles.metadataInfo}>
            <div>
              <FiCalendar
                color="#BBBBBB"
                size={22} />
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <FiUser
                color="#BBBBBB"
                size={22} />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock
                color="#BBBBBB"
                size={22} />
              <p>5 min</p>
            </div>
          </div>
        </section>
        <article>
          {post.data.content.map((content, index) => (
            <>
              <div
                key={index}
                className={styles.contentTitle}
                dangerouslySetInnerHTML={{ __html: content.heading }}
              />
              {content.body.map(item => (
                <div
                  className={styles.contentBody}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              ))}
            </>
          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],
    {
      fetch: ['post.title', 'post.author', 'post.banner', 'post.corpo_do_post'],
    }
  )

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid }
    })),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient()
  const response = await prismic.getByUID('posts', String(slug), {})

  const post = {
    first_publication_date: new Date(response.first_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url
      },
      author: RichText.asText(response.data.author),
      content: response.data.corpo_do_post.map(contentBody => ({
        heading: RichText.asHtml(contentBody.heading),
        body: contentBody.body.map(item => ({
          text: item.text
        }))
      }))
    }
  }

  return {
    props: {
      post
    }
  }
};
